import { Transaction } from "sequelize";
import db_mysql from "../db/connection_mysql";
import { Request, Response } from "express";
import Produto from "../models/ProdutosModel";
import Cliente from "../models/ClientesModel";
import Usuario from "../models/UsuariosModal";
import Vendas from "../models/VendasModel";
import Fornecedor from "../models/FornecedoresModel";

export default class VendaController {
  private static requiredFields = [
    "data_venda",
    "valor_total",
    "desconto",
    "cliente_fk",
    "produto_fk",
    "vendedor_fk",
    "valor_pago",
    "quantidade",
    "forma_pagamento",
  ];

  private static fieldDisplayNames: { [key: string]: string } = {
    data_venda: "Data da Venda",
    valor_total: "Valor Total",
    desconto: "Desconto",
    cliente_fk: "Cliente",
    produto_fk: "Produto",
    vendedor_fk: "Vendedor",
    valor_pago: "Valor Pago",
    quantidade: "Quantidade",
    forma_pagamento: "Forma de Pagamento",
  };

  private static handleServerError(
    error: unknown,
    res: Response,
    methodName: string
  ): void {
    console.error(`Erro em ${methodName}:`, error);
    res.status(500).json({ message: "Erro interno do servidor" });
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

  private static async validateVendaFields(
    data: any,
    res: Response,
    transaction: Transaction,
    isUpdate: boolean = false,
    currentId?: number
  ): Promise<boolean> {
    const errors: string[] = [];
    if (!isUpdate && !this.checkRequiredFields(data, res)) return false;

    if (errors.length > 0) {
      this.sendErrorResponse(res, 409, errors.join(", "));
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

  private static sendErrorResponse(
    res: Response,
    status: number,
    message: string
  ): void {
    res.status(status).json({ message });
    return;
  }

  static async allVenda(req: Request, res: Response): Promise<void> {
    await VendaController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const vendas = await Vendas.findAll({
          transaction,
          include: [
            {
              model: Cliente,
              as: "cliente",
              attributes: ["id", "nome", "email"],
            },
            {
              model: Produto,
              as: "produto",
              attributes: ["id", "nome", "preco", "estoque"],
            },
            {
              model: Usuario,
              as: "vendedor",
              attributes: ["id", "email", "login"],
            },
          ],
        });

        res.status(200).json(vendas.map((v) => v.toJSON()));
      },
      "allVenda"
    );
  }

  static async createVenda(req: Request, res: Response): Promise<void> {
    await VendaController.handleDatabaseOperation(
      res,
      async (transaction) => {
        if (
          !(await VendaController.validateVendaFields(
            req.body,
            res,
            transaction
          ))
        )
          return;
        const dadosVenda = {
          ...req.body,
          valor_total: parseFloat(req.body.valor_total),
          desconto: parseFloat(req.body.desconto),
          valor_pago: parseFloat(req.body.valor_pago),
          quantidade: parseInt(req.body.quantidade),
        };

        const venda = await Vendas.create(dadosVenda, {
          transaction,
        });

        res.status(201).json({
          message: "Venda criada com sucesso!",
          venda: venda.toJSON(),
        });
      },
      "createVenda"
    );
  }

  static async updateVenda(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    await VendaController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const vendaExistente = await Vendas.findByPk(id, {
          transaction,
        });

        if (!vendaExistente) {
          res.status(404).json({ message: "Venda não encontrada" });
          return;
        }

        if (
          !(await VendaController.validateVendaFields(
            req.body,
            res,
            transaction,
            true,
            Number(id)
          ))
        )
          return;

        // Construção segura dos campos alterados
        const camposAlterados: Partial<Vendas> = {};
        const camposPermitidos = [
          "data_venda",
          "desconto",
          "cliente_fk",
          "produto_fk",
          "vendedor_fk",
          "valor_pago",
          "quantidade",
          "forma_pagamento",
        ];
        const camposImutaveis = ["created_at", "updated_at"];

        for (const key of Object.keys(req.body)) {
          if (camposPermitidos.includes(key)) {
            if (!(key in vendaExistente.dataValues)) {
              VendaController.sendErrorResponse(
                res,
                400,
                `Campo '${key}' não existe na venda`
              );
              return;
            }

            if (camposImutaveis.includes(key)) {
              VendaController.sendErrorResponse(
                res,
                400,
                `Campo '${key}' é imutável`
              );
              return;
            }

            const valorAtual = vendaExistente.get(key as keyof Vendas);
            let novoValor = req.body[key];

            // Conversão específica para campos de data
            if (key === "data_venda") {
              if (isNaN(new Date(novoValor).getTime())) {
                VendaController.sendErrorResponse(res, 400, "Data inválida");
                return;
              }
              // Normaliza ambos os valores para Date objects
              const valorAtualDate = new Date(String(valorAtual ?? ""));
              const novoValorDate = new Date(novoValor);

              // Comparação de timestamp
              if (valorAtualDate.getTime() === novoValorDate.getTime()) {
                continue;
              }

              // Mantém o formato ISO para atualização
              novoValor = novoValorDate.toISOString();
            } else if (novoValor === valorAtual) {
              continue;
            }

            if (novoValor !== valorAtual) {
              camposAlterados[key as keyof Vendas] = novoValor;
            }
          }
        }
        
        if (Object.keys(camposAlterados).length === 0) {
          res
            .status(400)
            .json({ message: "Nenhum dado válido para atualização" });
          return;
        }

        await Vendas.update(camposAlterados, {
          where: { id },
          transaction,
        });

        const vendaAtualizada = await Vendas.findByPk(id, {
          transaction,
        });

        res.status(200).json({
          message: "Venda atualizada com sucesso!",
          fornecedor: vendaAtualizada?.toJSON(),
        });
      },
      "updateVenda"
    );
  }

  static async getVendaById(req: Request, res: Response): Promise<void> {
    await VendaController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const venda = await Vendas.findByPk(req.params.id, {
          transaction,
          include: [
            {
              model: Cliente,
              attributes: ["id", "nome", "email"],
            },
            {
              model: Produto,
              attributes: ["id", "nome", "preco", "quantidade"],
            },
            {
              model: Usuario,
              attributes: ["id", "email", "login"],
            },
          ],
        });
        VendaController.handleFornecedorResponse(res, venda);
      },
      "getVendaById"
    );
  }

  private static handleFornecedorResponse(
    res: Response,
    venda: Vendas | null
  ): void {
    if (!venda) {
      res.status(404).json({ message: "Venda não encontrada" });
      return;
    }
    res.status(200).json(venda.toJSON());
  }

  static async deleteVenda(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "ID inválido" });
      return;
    }

    await VendaController.handleDatabaseOperation(
      res,
      async (transaction) => {
        const venda = await Vendas.findByPk(id, { transaction });

        if (!venda) {
          res.status(404).json({ message: "Venda não encontrada" });
          return;
        }

        await venda.destroy({ transaction });
        res.status(200).json({ message: "Venda removida com sucesso" });
      },
      "deleteVenda"
    );
  }
}
