import { Model, DataTypes } from "sequelize";
import { IProduto } from "../interfaces/IProduto";
import db_mysql from "../db/connection_mysql";

class Produto extends Model<IProduto> implements IProduto {
  public id?: number;
  public nome!: string;
  public preco!: number;
  public estoque!: number;
  public fornecedor_fk!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // public readonly fornecedor?: Fornecedor;
}

Produto.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estoque: { type: DataTypes.INTEGER, allowNull: false },
    fornecedor_fk: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "fornecedores", key: "id" },
    },
  },
  {
    sequelize: db_mysql,
    modelName: "Produto",
    tableName: "produtos",
    timestamps: true,
    underscored: true,
  }
);

export default Produto;
