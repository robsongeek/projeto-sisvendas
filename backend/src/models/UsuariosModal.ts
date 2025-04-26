import { DataTypes, Model } from "sequelize";
import db_mysql from "../db/connection_mysql";
import { IUsuario } from "../interfaces/IUsuario";

class Usuario extends Model<IUsuario> implements IUsuario {
  public id!: number;
  public login!: string;
  public email!: string;
  public nivel_acesso!: string;
  public senha!: string;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nivel_acesso: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db_mysql,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: true,
    underscored: true,
  }
);

export default Usuario;
