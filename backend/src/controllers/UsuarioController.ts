import { Transaction, Op, UniqueConstraintError } from "sequelize";
import gerarToken from "../middlewares/GerarToken";
import obterToken from "../middlewares/ObterToken";
import sequelizeMysql from "../db/connection_mysql";
import { Request, Response } from "express";
import Usuarios from "../models/UsuariosModal";
import bcrypt from "bcrypt";

interface LoginRequest {
  login: string;
  senha: string;
}

const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: (missingField: string) =>
    `${missingField} é obrigatório!`,
  USER_NOT_FOUND: "Usuário não encontrado!",
  INVALID_PASSWORD: "Senha inválida!",
  SERVER_ERROR: "Erro interno do servidor",
};

const validateLoginInput = (body: Partial<LoginRequest>): string | null => {
  if (!body.login) return ERROR_MESSAGES.MISSING_CREDENTIALS("O nome do login");
  if (!body.senha) return ERROR_MESSAGES.MISSING_CREDENTIALS("A senha");
  return null;
};

export default class UsuarioController {
  private static requiredFields = [
    "login",
    "email",
    "nivel_acesso",
    "senha",
    "confirmacao_senha",
  ];

  private static fieldDisplayNames: { [key: string]: string } = {
    login: "Login",
    email: "E-mail",
    nivel_acesso: "Nível de Acesso",
    senha: "Senha",
    confirmacao_senha: "Confirmar Senha",
  };

  private static handleServerError(
    error: unknown,
    res: Response,
    methodName: string
  ): void {
    console.error(`Erro em ${methodName}:`, error);

    if (error instanceof UniqueConstraintError) {
      const conflictField = error.errors[0].path;
      const message =
        conflictField === "login"
          ? "Login já cadastrado!"
          : "Email já cadastrado!";
      res.status(409).json({ message });
      return;
    }

    const message =
      error instanceof Error
        ? `Erro no servidor - ${methodName}: ${error.message}`
        : `Erro no servidor - ${methodName}`;
    res.status(500).json({ message });
  }

  private static async handleDatabaseOperation(
    res: Response,
    operation: (transaction: Transaction) => Promise<void>,
    methodName: string
  ): Promise<void> {
    const transaction = await sequelizeMysql.transaction();
    try {
      await operation(transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      this.handleServerError(error, res, methodName);
    }
  }

  private static async validateUsuarioFields(
    data: any,
    res: Response,
    transaction?: Transaction,
    isUpdate: boolean = false,
    currentId?: number
  ): Promise<boolean> {
    if (!isUpdate && !this.checkRequiredFields(data, res)) return false;
    if (isUpdate && !this.checkRequiredFieldsUpdate(data, res)) return false;
    if (!this.validateFieldFormats(data, res)) return false;
    if (!(await this.checkUniqueFields(data, res, transaction, currentId)))
      return false;
    if (!isUpdate && !this.validatePasswordConfirmation(data, res))
      return false;
    if (isUpdate && !this.validatePasswordConfirmationUpdate(data, res))
      return false;

    return true;
  }

  private static checkRequiredFields(data: any, res: Response): boolean {
    const missingFields = this.requiredFields
      .filter((field) => !data[field])
      .map((field) => this.fieldDisplayNames[field]);

    if (missingFields.length > 0) {
      this.sendErrorResponse(
        res,
        422,
        `Campos obrigatórios faltando: ${missingFields.join(", ")}`
      );
      return false;
    }
    return true;
  }

  private static checkRequiredFieldsUpdate(data: any, res: Response): boolean {
    // Filtrar campos obrigatórios excluindo 'senha' e 'confirmacao_senha'
    const filteredRequiredFields = this.requiredFields.filter(
      (field) => field !== "senha" && field !== "confirmacao_senha"
    );

    const missingFields = filteredRequiredFields
      .filter((field) => !data[field])
      .map((field) => this.fieldDisplayNames[field]);

    if (missingFields.length > 0) {
      this.sendErrorResponse(
        res,
        422,
        `Campos obrigatórios faltando: ${missingFields.join(", ")}`
      );
      return false;
    }
    return true;
  }

  private static validatePasswordConfirmation(
    data: any,
    res: Response
  ): boolean {
    if (data.senha !== data.confirmacao_senha) {
      this.sendErrorResponse(res, 400, "Senhas não conferem!");
      return false;
    }

    return true;
  }

  private static validatePasswordConfirmationUpdate(
    data: any,
    res: Response
  ): boolean {
    const { senha, confirmacao_senha } = data;
    if (confirmacao_senha && !senha) {
      this.sendErrorResponse(res, 400, "Campos obrigatórios faltando: Senha");
      return false;
    }

    if (senha && !confirmacao_senha) {
      this.sendErrorResponse(
        res,
        400,
        "Campos obrigatórios faltando: Confirmar Senha"
      );
      return false;
    }

    if (senha !== confirmacao_senha) {
      this.sendErrorResponse(res, 400, "Senhas não conferem!");
      return false;
    }
    return true;
  }

  private static validateFieldFormats(data: any, res: Response): boolean {
    const validations = [
      {
        field: "email",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "E-mail inválido!",
      },
      {
        field: "login",
        regex: /^[a-zA-Z0-9_]{4,20}$/,
        message:
          "Login deve conter 4-20 caracteres alfanuméricos ou underscores",
      },
    ];

    for (const validation of validations) {
      if (
        data[validation.field] &&
        !validation.regex.test(data[validation.field])
      ) {
        this.sendErrorResponse(res, 400, validation.message);
        return false;
      }
    }
    return true;
  }

  private static async checkUniqueFields(
    data: any,
    res: Response,
    transaction?: Transaction,
    currentId?: number
  ): Promise<boolean> {
    try {
      const errors = [];
      const whereClause: any = {};

      // Só adiciona a condição de ID se houver currentId
      if (currentId !== undefined) {
        whereClause.id = { [Op.ne]: currentId };
      }

      if (data.login) {
        const loginExistente = await Usuarios.findOne({
          where: { ...whereClause, login: data.login },
          transaction,
        });
        if (loginExistente) errors.push("Login já está em uso");
      }

      if (data.email) {
        const emailExistente = await Usuarios.findOne({
          where: { ...whereClause, email: data.email },
          transaction,
        });
        if (emailExistente) errors.push("E-mail já cadastrado");
      }

      if (errors.length > 0) {
        this.sendErrorResponse(res, 409, errors.join(", "));
        return false;
      }
      return true;
    } catch (error) {
      this.handleServerError(error, res, "checkUniqueFields");
      return false;
    }
  }

  private static sendErrorResponse(
    res: Response,
    status: number,
    message: string
  ): void {
    res.status(status).json({ message });
  }

  private static handleUsuarioResponse(
    res: Response,
    usuario: Usuarios | null
  ): void {
    if (!usuario) {
      UsuarioController.sendErrorResponse(res, 404, "Usuário não encontrado");
      return;
    }
    res.status(200).json(usuario.toJSON());
  }

  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response
  ): Promise<void> {
    try {
      const validationError = validateLoginInput(req.body);
      if (validationError) {
        res.status(422).json({ message: validationError });
        return;
      }

      const { login, senha } = req.body;

      const user = await Usuarios.findOne({
        where: { login },
      });

      if (!user) {
        res.status(422).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      const isPasswordValid = await bcrypt.compare(senha, user.senha);
      if (!isPasswordValid) {
        res.status(422).json({ message: ERROR_MESSAGES.INVALID_PASSWORD });
        return;
      }

      await gerarToken(user, req, res);
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        message: ERROR_MESSAGES.SERVER_ERROR,
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  }

  static async allUsuario(req: Request, res: Response): Promise<void> {
    await UsuarioController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const usuarios = await Usuarios.findAll({
          attributes: {
            exclude: ["senha", "confirmacao_senha"],
          },
          transaction,
        });
        res.status(200).json(usuarios.map((u) => u.toJSON()));
      },
      "allUsuario"
    );
  }

  static async createUsuario(req: Request, res: Response): Promise<void> {
    await UsuarioController.handleDatabaseOperation(
      res,
      async (transaction) => {
        if (
          !(await UsuarioController.validateUsuarioFields(
            req.body,
            res,
            transaction
          ))
        )
          return;

        const senhaHash = await bcrypt.hash(req.body.senha, 10);
        const usuario = await Usuarios.create(
          {
            login: req.body.login,
            email: req.body.email,
            nivel_acesso: req.body.nivel_acesso,
            senha: senhaHash,
          },
          { transaction }
        );

        res.status(201).json({
          message: "Usuário criado com sucesso!",
          usuario: usuario.toJSON(),
        });
      },
      "createUsuario"
    );
  }

  static async updateUsuario(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      UsuarioController.sendErrorResponse(res, 400, "ID inválido");
      return;
    }

    await UsuarioController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const usuarioExistente = await Usuarios.findByPk(id, { transaction });

        if (!usuarioExistente) {
          UsuarioController.sendErrorResponse(
            res,
            404,
            "Usuário não encontrado"
          );
          return;
        }

        if (
          !(await UsuarioController.validateUsuarioFields(
            req.body,
            res,
            transaction,
            true,
            Number(id)
          ))
        ) {
          return;
        }

        const camposAlterados: Partial<Usuarios> = {};
        const camposPermitidos = ["login", "email", "nivel_acesso", "senha"];
        const camposImutaveis = ["createdAt", "updatedAt"];

        for (const key of Object.keys(req.body)) {
          if (camposPermitidos.includes(key)) {
            // Verifica se o campo existe no modelo
            if (!(key in usuarioExistente.dataValues)) {
              UsuarioController.sendErrorResponse(
                res,
                400,
                `Campo '${key}' não existe no usuário`
              );
              return;
            }

            // Ignora campos imutáveis (embora não estejam em camposPermitidos, verificação adicional)
            if (camposImutaveis.includes(key)) {
              console.log(`Campo bloqueado: ${key}`);
              continue;
            }

            const valorAtual = usuarioExistente.get(
              key as keyof Usuarios
            ) as string;
            const novoValor = req.body[key];

            // Tratamento especial para o campo 'senha'
            if (key === "senha") {
              const senhaIgual = await bcrypt.compare(novoValor, valorAtual);
              if (senhaIgual) {
                continue; // Senha não foi alterada
              }
              // Gera novo hash apenas se a senha for diferente
              const hashSenha = await bcrypt.hash(novoValor, 10);
              (camposAlterados as any)[key] = hashSenha;
            } else {
              // Para outros campos, verifica alteração
              if (valorAtual !== novoValor) {
                camposAlterados[key as keyof Usuarios] = novoValor;
              }
            }
          }
        }

        if (Object.keys(camposAlterados).length === 0) {
          UsuarioController.sendErrorResponse(
            res,
            400,
            "Nenhum dado válido para atualização"
          );
          return;
        }

        await Usuarios.update(camposAlterados, {
          where: { id },
          transaction,
        });

        const usuarioAtualizado = await Usuarios.findByPk(id, { transaction });
        res.status(200).json({
          message: "Usuário atualizado com sucesso!",
          usuario: usuarioAtualizado?.toJSON(),
        });
      },
      "updateUsuario"
    );
  }
  static async getUsuarioById(req: Request, res: Response): Promise<void> {
    await UsuarioController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const usuario = await Usuarios.findByPk(req.params.id, { transaction });
        UsuarioController.handleUsuarioResponse(res, usuario);
      },
      "getUsuarioById"
    );
  }

  static async deleteUsuario(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      UsuarioController.sendErrorResponse(res, 400, "ID inválido");
      return;
    }

    await UsuarioController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const usuario = await Usuarios.findByPk(id, { transaction });

        if (!usuario) {
          this.sendErrorResponse(res, 404, "Usuário não encontrado");
          return;
        }

        await usuario.destroy({ transaction });
        res.status(200).json({ message: "Usuário removido com sucesso" });
      },
      "deleteUsuario"
    );
  }
}
