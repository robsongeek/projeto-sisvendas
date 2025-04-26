import { Model } from 'sequelize';
import express from "express";
import mysql from "./db/connection_mysql";
import dontenv from "dotenv-safe";
import { Request, Response, NextFunction, Application } from "express";
import clienteRoutes from "./routes/ClienteRoutes";
import fornecedorRoutes from "./routes/FornecedorRoutes";
import produtoRoutes from "./routes/ProdutoRoutes";
import usuarioRoutes from "./routes/UsuarioRoutes";
import vendaRoutes from "./routes/VendaRoutes";
import cors from 'cors';

// Importação do modelo com tipo
const Cliente = require("./models/ClientesModel") as typeof import("./models/ClientesModel").default & {
  new (): ClienteModel;
};

const Fornecedor = require("./models/FornecedoresModel") as typeof import("./models/FornecedoresModel").default & {
  new (): FornecedorModel;
};

const Produto = require("./models/ProdutosModel") as typeof import("./models/ProdutosModel").default & {
  new (): ProdutosModel;
};

const Usuario = require("./models/UsuariosModal") as typeof import("./models/UsuariosModal").default & {
  new (): UsuariosModel;
};

const Vendas = require("./models/VendasModel") as typeof import("./models/VendasModel").default & {
  new (): VendasModel;
};

// Interface do modelo Cliente
interface ClienteModel extends Model {
  id?: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  celular?: string;
  email: string;
  cpf?: string;
  sexo: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

interface FornecedorModel extends Model {
  id?: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  celular?: string;
  cnpj: string;
  email: string;
  status: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

interface ProdutosModel extends Model {
  id?: number;
  nome: string;
  preco: number;
  estoque: number;
  fornecedor_fk: number;
  readonly created_at: Date;
  readonly updated_at: Date;
}

interface UsuariosModel extends Model {
  id?: number;
  login: string;
  email: string;
  nivel_acesso: string;
  senha: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

interface VendasModel extends Model {
  id?: number;
  cliente_fk: number;
  produto_fk: number;
  usuario_fk: number;
  quantidade: number;
  valor_total: number;
  readonly created_at: Date;
  readonly updated_at: Date;
}


dontenv.config();

const app: Application = express();

const corsOptions = {
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:3000",
};
app.use(cors({
  allowedHeaders: ['Authorization', 'Content-Type'], 
}));
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());

app.use("/clientes", clienteRoutes);
app.use("/fornecedores", fornecedorRoutes);
app.use("/produtos", produtoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/vendas", vendaRoutes);

const startServer = async (): Promise<void> => {
  try {
    console.log("Iniciando sincronização do banco de dados...");
    
    // Sincronização do banco
    await mysql.sync({ force: false });
    console.log("Banco de dados sincronizado com sucesso!");

    app.listen(process.env.PORT, () => {
      console.log(`Servidor rodando na porta ${process.env.PORT}`);
    });

    // Verificação das tabelas
    const tables: string[] = await mysql.getQueryInterface().showAllTables();
    console.log("Tabelas criadas:", tables);

  } catch (error: unknown) {
    console.error("Erro ao reiniciar o servidor:", error);
    process.exit(1);
  }
};

startServer();