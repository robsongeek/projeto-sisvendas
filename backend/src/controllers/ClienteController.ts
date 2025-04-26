import { Transaction, Op, UniqueConstraintError } from "sequelize";
import sequelizeMysql from "../db/connection_mysql";
import Cliente from "../models/ClientesModel";
import { Request, Response } from "express";

export default class ClienteController {
  private static requiredFields = [
    "nome",
    "endereco",
    "bairro",
    "cidade",
    "uf",
    "cep",
    "cpf",
    "email",
    "sexo",
  ];

  private static fieldDisplayNames: { [key: string]: string } = {
    nome: "Nome",
    endereco: "Endereço",
    bairro: "Bairro",
    cidade: "Cidade",
    uf: "UF",
    cep: "CEP",
    cpf: "CPF",
    email: "E-mail",
    sexo: "Gênero",
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
        conflictField === "cpf"
          ? "CPF já cadastrado!"
          : "E-mail já cadastrado!";
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

  private static async validateClienteFields(
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

  private static validateFieldFormats(data: any, res: Response): boolean {
    const validations = [
      {
        field: "cep",
        // regex: /^[0-9]{5}-?[0-9]{3}$/,
        regex: /^\d{5}-?\d{3}$/,
        message: "CEP inválido! Formato esperado: 00000-000",
        required: true,
        format: (value: string) => value.replace(/(\d{5})(\d{3})/, "$1-$2"),
      },
      {
        field: "cpf",
        regex: /^([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}|[0-9]{11})$/,
        message: "CPF inválido! Use 000.000.000-00 ou 00000000000",
        required: true,
      },
      {
        field: "telefone",
        regex: /^(?:\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/,
        message: "Telefone inválido! Formato: (00)0000-0000",
        required: false,
      },
      {
        field: "celular",
        regex: /^(?:\(\d{2}\)\s?)?(?:9\s?)?\d{4}-?\d{4}$/,
        // regex: /^(\(\d{2}\)\d{5}-\d{4}|\d{11}|\d{10})$/,
        message: "Celular inválido! Formato: (00)90000-0000",
        required: false,
      },
      {
        field: "email",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "E-mail inválido!",
        required: true,
      },
    ];

    for (const validation of validations) {
      const value = data[validation.field];

      // Verifica se o campo é obrigatório e está presente/vazio
      if (validation.required && !value) {
        this.sendErrorResponse(
          res,
          400,
          `${this.fieldDisplayNames[validation.field]} é obrigatório`
        );
        return false;
      }

      if (value) {
        // Aplica formatação antes de validar
        if (validation.format) {
          const valueTest = validation.format(value);
          data[validation.field] = valueTest;
        }

        if (value && !validation.regex.test(value)) {
          this.sendErrorResponse(res, 400, validation.message);
          return false;
        }
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

      if (currentId !== undefined) {
        whereClause.id = { [Op.ne]: currentId };
      }

      if (data.cpf) {
        const cpfExistente = await Cliente.findOne({
          where: { ...whereClause, cpf: data.cpf },
          transaction,
        });
        if (cpfExistente) errors.push("CPF já está em uso");
      }

      if (data.email) {
        const emailExistente = await Cliente.findOne({
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

  static async allCliente(req: Request, res: Response): Promise<void> {
    await ClienteController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const clientes = await Cliente.findAll({ transaction });
        res.status(200).json(clientes.map((c) => c.toJSON()));
      },
      "allCliente"
    );
  }

  static async createCliente(req: Request, res: Response): Promise<void> {
    await ClienteController.handleDatabaseOperation(
      res,
      async (transaction) => {
        if (
          !(await ClienteController.validateClienteFields(
            req.body,
            res,
            transaction
          ))
        )
          return;

        const cliente = await Cliente.create(req.body, { transaction });
        res.status(201).json({
          message: "Cliente criado com sucesso!",
          cliente: cliente.toJSON(),
        });
      },
      "createCliente"
    );
  }

  static async updateCliente(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      ClienteController.sendErrorResponse(res, 400, "ID inválido");
      return;
    }

    await ClienteController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const clienteExistente = await Cliente.findByPk(id, { transaction });

        if (!clienteExistente) {
          ClienteController.sendErrorResponse(
            res,
            404,
            "Cliente não encontrado"
          );
          return;
        }

        if (
          !(await ClienteController.validateClienteFields(
            req.body,
            res,
            transaction,
            true,
            Number(id)
          ))
        ) {
          return;
        }

        type CamposAtualizaveis = Pick<
          Cliente,
          | "nome"
          | "endereco"
          | "bairro"
          | "cidade"
          | "uf"
          | "cep"
          | "cpf"
          | "email"
          | "sexo"
        >;

        const camposAlterados: Partial<CamposAtualizaveis> = {};
        // const camposImutaveis = ["created_at", "updated_at"];
        const camposImutaveis = ["createdAt", "updatedAt"];

        for (const key of Object.keys(req.body)) {
          const campo = key as keyof CamposAtualizaveis;

          const campoCamelCase =
            key === "created_at"
              ? "createdAt"
              : key === "updated_at"
              ? "updatedAt"
              : key;

          if (
            camposImutaveis.includes(campoCamelCase as keyof CamposAtualizaveis)
          ) {
            console.log(`Campo bloqueado: ${key}`);
            continue;
          }

          if (!(campo in clienteExistente.dataValues)) {
            ClienteController.sendErrorResponse(
              res,
              400,
              `Campo '${key}' não existe no cliente`
            );
            return;
          }

          const valorAtual = clienteExistente.get(campo as keyof Cliente);
          const novoValor = req.body[key];

          if (valorAtual !== novoValor) {
            camposAlterados[campo] = novoValor;
          }
        }

        if (Object.keys(camposAlterados).length === 0) {
          ClienteController.sendErrorResponse(
            res,
            400,
            "Nenhum dado válido para atualização"
          );
          return;
        }
        // console.log("camposAlterados", camposAlterados);
        await Cliente.update(camposAlterados, {
          where: { id },
          transaction,
        });

        const clienteAtualizado = await Cliente.findByPk(id, { transaction });
        res.status(200).json({
          message: "Cliente atualizado com sucesso!",
          cliente: clienteAtualizado?.toJSON(),
        });
      },
      "updateCliente"
    );
  }

  static async getClienteById(req: Request, res: Response): Promise<void> {
    await ClienteController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const cliente = await Cliente.findByPk(req.params.id, { transaction });
        ClienteController.handleClienteResponse(res, cliente);
      },
      "getClienteById"
    );
  }

  private static handleClienteResponse(
    res: Response,
    cliente: Cliente | null
  ): void {
    if (!cliente) {
      ClienteController.sendErrorResponse(res, 404, "Cliente não encontrado");
      return;
    }
    res.status(200).json(cliente.toJSON());
  }

  static async deleteCliente(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      ClienteController.sendErrorResponse(res, 400, "ID inválido");
      return;
    }

    await ClienteController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const cliente = await Cliente.findByPk(id, { transaction });

        if (!cliente) {
          ClienteController.sendErrorResponse(
            res,
            404,
            "Cliente não encontrado"
          );
          return;
        }

        await cliente.destroy({ transaction });
        res.status(200).json({ message: "Cliente removido com sucesso" });
      },
      "deleteCliente"
    );
  }
}
