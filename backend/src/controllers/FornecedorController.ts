import { Transaction, Op, UniqueConstraintError } from "sequelize";
import db_mysql from "../db/connection_mysql";
import { Request, Response } from "express";
import { Produto, Fornecedor } from "../models/CentralizaAssociacoes";

export default class FornecedorController {
  private static requiredFields = [
    "nome",
    "endereco",
    "bairro",
    "cidade",
    "uf",
    "cep",
    "telefone",
    "celular",
    "cnpj",
    "email",
    "status",
  ];

  private static fieldDisplayNames: { [key: string]: string } = {
    nome: "Nome",
    endereco: "Endereço",
    bairro: "Bairro",
    cidade: "Cidade",
    uf: "UF",
    cep: "CEP",
    telefone: "Telefone",
    celular: "Celular",
    cnpj: "CNPJ",
    email: "E-mail",
    status: "Status",
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
        conflictField === "cnpj"
          ? "CNPJ já cadastrado!"
          : "Email já cadastrado!";
      res.status(409).json({ message });
      return;
    }

    const message =
      error instanceof Error
        ? `Erro no servidor - ${methodName}: ${error.message}`
        : `Erro no servidor - ${methodName}`;
    res.status(500).json({ message });
    return;
  }

  private static async handleDatabaseOperation(
    res: Response,
    operation: (transaction: Transaction) => Promise<void>,
    methodName: string
  ): Promise<void> {
    const transaction = await db_mysql.transaction();
    try {
      await operation(transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      this.handleServerError(error, res, methodName);
    }
  }

  private static async validateFornecedorFields(
    data: any,
    res: Response,
    transaction?: Transaction,
    isUpdate: boolean = false,
    currentId?: number
  ): Promise<boolean> {
    // Campos obrigatórios apenas para criação
    if (!isUpdate && !this.checkRequiredFields(data, res)) return false;
    if (!this.validateFieldFormats(data, res)) return false;
    // Validação de unicidade condicional
    if ((isUpdate && data.cnpj) || !isUpdate) {
      if (!(await this.checkUniqueFields(data, res, transaction, currentId)))
        return false;
    }

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

  private static validateFieldFormats(data: any, res: Response): boolean {
    const validations = [
      {
        field: "cep",
        regex: /^\d{5}-?\d{3}$/,
        message: "CEP inválido! Formato esperado: 00000-000",
        required: true,
        format: (value: string) => value.replace(/(\d{5})(\d{3})/, "$1-$2"),
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
        field: "cnpj",
        regex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        message: "CNPJ inválido! Formato: 00.000.000/0000-00",
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
      const errors: string[] = [];

      if (data.cnpj) {
        const cnpjExistente = await Fornecedor.findOne({
          where: {
            cnpj: data.cnpj,
            ...(currentId && { id: { [Op.not]: currentId } }),
          },
          transaction,
        });
        if (cnpjExistente) errors.push("CNPJ já cadastrado");
      }

      if (data.email) {
        const emailExistente = await Fornecedor.findOne({
          where: {
            email: data.email,
            ...(currentId && { id: { [Op.not]: currentId } }),
          },
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
    return;
  }

  static async allFornecedor(req: Request, res: Response): Promise<void> {
    await FornecedorController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const fornecedores = await Fornecedor.findAll({ transaction });
        res.status(200).json(fornecedores.map((c) => c.toJSON()));
      },
      "allFornecedor"
    );
  }

  static async createFornecedor(req: Request, res: Response): Promise<void> {
    await FornecedorController.handleDatabaseOperation(
      res,
      async (transaction) => {
        if (
          !(await FornecedorController.validateFornecedorFields(
            req.body,
            res,
            transaction
          ))
        )
          return;

        const fornecedor = await Fornecedor.create(req.body, {
          transaction,
        });

        res.status(201).json({
          message: "Fornecedor criado com sucesso!",
          fornecedor: fornecedor.toJSON(),
        });
      },
      "createFornecedor"
    );
  }

  static async updateFornecedor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    await FornecedorController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const fornecedorExistente = await Fornecedor.findByPk(id, {
          transaction,
        });

        if (!fornecedorExistente) {
          res.status(404).json({ message: "Fornecedor não encontrado" });
          return;
        }

        // Validação incluindo o ID atual
        if (
          !(await FornecedorController.validateFornecedorFields(
            req.body,
            res,
            transaction,
            true,
            Number(id)
          ))
        )
          return;

        // Construção segura dos campos alterados
        const camposAlterados: Partial<Fornecedor> = {};
        const camposImutaveis: string[] = ["created_at", "updated_at"];

        // Remoção preventiva de campos técnicos
        const body = { ...req.body };
        delete body.createdAt;
        delete body.updatedAt;

        for (const key of Object.keys(body)) {
          if (camposImutaveis.includes(key)) {
            res.status(400).json({
              message: `Campo '${key}' não pode ser alterado`,
            });
            return;
          }

          if (!(key in fornecedorExistente.dataValues)) continue;

          const valorAtual = fornecedorExistente.get(key as keyof Fornecedor);
          const novoValor = req.body[key];

          if (novoValor !== valorAtual) {
            camposAlterados[
              key as Exclude<keyof Fornecedor, "created_at" | "updated_at">
            ] = novoValor;
          }
        }

        if (Object.keys(camposAlterados).length === 0) {
          res
            .status(400)
            .json({ message: "Nenhum dado válido para atualização" });
          return;
        }

        await Fornecedor.update(camposAlterados, {
          where: { id },
          transaction,
        });

        const fornecedorAtualizado = await Fornecedor.findByPk(id, {
          transaction,
        });

        res.status(200).json({
          message: "Fornecedor atualizado com sucesso!",
          fornecedor: fornecedorAtualizado?.toJSON(),
        });
      },
      "updateFornecedor"
    );
  }

  static async getFornecedorById(req: Request, res: Response): Promise<void> {
    await FornecedorController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const fornecedor = await Fornecedor.findByPk(req.params.id, {
          transaction,
        });
        FornecedorController.handleFornecedorResponse(res, fornecedor);
      },
      "getFornecedorById"
    );
  }

  private static handleFornecedorResponse(
    res: Response,
    fornecedor: Fornecedor | null
  ): void {
    if (!fornecedor) {
      res.status(404).json({ message: "Fornecedor não encontrado" });
      return;
    }
    res.status(200).json(fornecedor.toJSON());
  }

  static async deleteFornecedor(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    await FornecedorController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const fornecedor = await Fornecedor.findByPk(id, { transaction });

        if (!fornecedor) {
          res.status(404).json({ message: "Fornecedor não encontrado" });
          return;
        }

        await fornecedor.destroy({ transaction });
        res.status(200).json({ message: "Fornecedor removido com sucesso" });
      },
      "deleteFornecedor"
    );
  }
}
