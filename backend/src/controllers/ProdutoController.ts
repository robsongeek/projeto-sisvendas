import { Transaction } from "sequelize";
import sequelizeMysql from "../db/connection_mysql";
import { Request, Response } from "express";
// import Produto from "../models/ProdutosModel";
// import Fornecedor from "../models/FornecedoresModel";
import { Produto, Fornecedor } from "../models/CentralizaAssociacoes";

export default class ProdutoController {
  private static requiredFields = ["nome", "preco", "estoque", "fornecedor_fk"];

  private static fieldDisplayNames: { [key: string]: string } = {
    nome: "Nome",
    preco: "Preço",
    estoque: "Quantidade",
    fornecedor_fk: "Fornecedor",
  };

  private static handleServerError(
    error: unknown,
    res: Response,
    methodName: string
  ): void {
    console.error(`Erro em ${methodName}:`, error);
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

  private static validateProdutoFields(data: any, res: Response): boolean {
    const missingFields = ProdutoController.requiredFields
      .filter((field) => !data[field])
      .map((field) => ProdutoController.fieldDisplayNames[field] || field);

    if (missingFields.length > 0) {
      res.status(422).json({
        message: `Campos obrigatórios faltando: ${missingFields.join(", ")}`,
      });
      return false;
    }

    return true;
  }

  static async allProduto(req: Request, res: Response): Promise<void> {
    await ProdutoController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const produtos = await Produto.findAll({
          transaction,
          include: [
            {
              model: Fornecedor,
              as: "fornecedor",
              attributes: ["id", "nome"],
              required: false,
            },
          ],
        });
        res.status(200).json(produtos.map((c) => c.toJSON()));
      },
      "allProduto"
    );
  }

  static async createProduto(req: Request, res: Response): Promise<void> {
    if (!ProdutoController.validateProdutoFields(req.body, res)) return;

    await ProdutoController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const produto = await Produto.create(req.body, { transaction });
        res.status(201).json({
          message: "Produto criado com sucesso!",
          produto: produto.toJSON(),
        });
      },
      "createProduto"
    );
  }

  static async updateProduto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    if (!ProdutoController.validateProdutoFields(req.body, res)) return;

    await ProdutoController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const produtoExistente = await Produto.findByPk(id, {
          transaction,
        });

        if (!produtoExistente) {
          res.status(404).json({ message: "Produto não encontrado" });
          return;
        }

        const camposAlterados: Partial<Produto> = {};
        const camposImutaveis: string[] = ["created_at", "updated_at"];

        const body = req.body;
        delete body.createdAt;
        delete body.updatedAt;

        for (const key of Object.keys(body)) {
          if (camposImutaveis.includes(key)) {
            res.status(400).json({
              message: `Campo '${key}' não pode ser alterado`,
            });
            return;
          }

          if (!(key in produtoExistente.dataValues)) continue;

          const valorAtual = produtoExistente.get(key as keyof Fornecedor);
          const novoValor = req.body[key];

          if (novoValor !== valorAtual) {
            camposAlterados[
              key as Exclude<keyof Produto, "created_at" | "updated_at">
            ] = novoValor;
          }
        }

        if (Object.keys(camposAlterados).length === 0) {
          res
            .status(400)
            .json({ message: "Nenhum dado válido para atualização" });
          return;
        }

        await Produto.update(req.body, {
          where: { id },
          transaction,
        });

        await Produto.findByPk(id, { transaction });
        res.status(200).json({
          message: "Produto atualizado com sucesso!",
        });
      },
      "updateProduto"
    );
  }

  static async getProdutoById(req: Request, res: Response): Promise<void> {
    await ProdutoController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const produto = await Produto.findByPk(req.params.id, {
          transaction,
          include: [
            {
              model: Fornecedor,
              as: "fornecedor",
              attributes: ["id", "nome"],
              required: false,
            },
          ],
        });
        ProdutoController.handleProdutoResponse(res, produto);
      },
      "getProdutoById"
    );
  }

  private static handleProdutoResponse(
    res: Response,
    produto: Produto | null
  ): void {
    if (!produto) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }
    res.status(200).json(produto.toJSON());
  }

  static async deleteProduto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    await ProdutoController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const produto = await Produto.findByPk(id, { transaction });

        if (!produto) {
          res.status(404).json({ message: "Produto não encontrado" });
          return;
        }

        await produto.destroy({ transaction });
        res.status(200).json({ message: "Produto removido com sucesso" });
      },
      "deleteProduto"
    );
  }
}
