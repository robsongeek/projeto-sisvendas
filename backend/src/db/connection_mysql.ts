import { Sequelize } from "sequelize";
import dotenv from "dotenv-safe";

dotenv.config({
  allowEmptyValues: true,
});

const db_mysql = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    timezone: "-03:00",
    dialectOptions: {
      statement_timeout: 1000,
      idle_in_transaction_session_timeout: 5000,
      // useUTC: false,
    },
    pool: {
      max: 15,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
  }
);

const authenticateDatabase = async (): Promise<void> => {
  try {
    await db_mysql.authenticate();
    console.log("Conectamos com sucesso com Sequelize no MySQL!");
  } catch (error) {
    console.error(
      "Não foi possível conectar ao banco de dados:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );
    process.exit(1);
  }
};

authenticateDatabase();

export default db_mysql;