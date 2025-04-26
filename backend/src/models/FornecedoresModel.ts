import { Model, DataTypes } from 'sequelize';
import db_mysql from '../db/connection_mysql';
import { IFornecedor } from '../interfaces/IFornecedor';

class Fornecedor extends Model<IFornecedor> implements IFornecedor {
  public id?: number;
  public nome!: string;
  public endereco!: string;
  public bairro!: string;
  public cidade!: string;
  public uf!: string;
  public cep!: string;
  public telefone?: string;
  public celular?: string;
  public cnpj!: string;
  public email!: string;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // public readonly produtos?: Produto[];
}

Fornecedor.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    endereco: { type: DataTypes.STRING, allowNull: false },
    bairro: { type: DataTypes.STRING, allowNull: false },
    cidade: { type: DataTypes.STRING, allowNull: false },
    uf: { type: DataTypes.STRING(2), allowNull: false },
    cep: { type: DataTypes.STRING(9), allowNull: false },
    telefone: { type: DataTypes.STRING(13), allowNull: true },
    celular: { type: DataTypes.STRING(14), allowNull: true },
    cnpj: { type: DataTypes.STRING(18), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    status: { type: DataTypes.STRING(1), allowNull: false, defaultValue: 'A' },
  },
  {
    sequelize: db_mysql,
    modelName: "Fornecedor",
    tableName: "fornecedores",
    timestamps: true,
    underscored: true,
  }
);

// import Produto from './ProdutosModel';
// Fornecedor.hasMany(Produto, {
//   foreignKey: "fornecedor_fk",
//   onDelete: "CASCADE", 
//   onUpdate: "CASCADE",
//   as: "produtos",
// });

export default Fornecedor;