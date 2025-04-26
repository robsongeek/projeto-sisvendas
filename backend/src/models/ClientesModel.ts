import { Model, DataTypes } from "sequelize";
import { ICliente } from "../interfaces/ICliente";
import  db_mysql from "../db/connection_mysql";

class Cliente extends Model<ICliente> implements ICliente {
  public id?: number;
  public nome!: string;
  public endereco!: string;
  public bairro!: string;
  public cidade!: string;
  public uf!: string;
  public cep!: string;
  public telefone?: string;
  public celular?: string;
  public email!: string;
  public cpf?: string;
  public sexo!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Cliente.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    endereco: { type: DataTypes.STRING, allowNull: false },
    bairro: { type: DataTypes.STRING, allowNull: false },
    cidade: { type: DataTypes.STRING, allowNull: false },
    uf: { type: DataTypes.STRING(2), allowNull: false },
    cep: { type: DataTypes.STRING(9), allowNull: false },
    telefone: { type: DataTypes.STRING(13), allowNull: true },
    celular: { type: DataTypes.STRING(14), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    sexo:{ type: DataTypes.STRING(1), allowNull: false, defaultValue: 'M' },
  },
  {
    sequelize: db_mysql,
    modelName: "Cliente",
    tableName: "clientes",
    timestamps: true,
    underscored: true,
  }
);

export default Cliente;
