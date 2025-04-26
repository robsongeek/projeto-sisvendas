import { Model, DataTypes } from "sequelize";
import db_mysql from "../db/connection_mysql";
import { IVenda } from "../interfaces/IVenda";

class Vendas extends Model<IVenda> implements IVenda {
  public id?: number;
  public data_venda!: Date;
  public valor_total!: number;
  public desconto!: number;
  public cliente_fk!: number;
  public produto_fk!: number;
  public vendedor_fk!: number;
  public valor_pago!: number;
  public quantidade!: number;
  public forma_pagamento!: string;
}

Vendas.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data_venda: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valor_total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    desconto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cliente_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produto_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendedor_fk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor_pago: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    forma_pagamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db_mysql,
    modelName: "Vendas",
    tableName: "vendas",
    timestamps: true,
    underscored: true,
  }
);

export default Vendas;
