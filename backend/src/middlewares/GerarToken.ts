import jwt from "jsonwebtoken";
import path from "path";
import { Request, Response } from "express";

require("dotenv-safe").config({
  path: path.resolve(__dirname, "../.env"),
});

interface User {
  id: string | number;
  login: string;
  // nivel_acesso: string;
}

interface TokenResponse {
  message: string;
  token: string;
  data: Omit<User, "senha">;
}

/**
 * @param user - Objeto usuário com propriedades necessárias
 * @param req - Objeto Request do Express
 * @param res - Objeto Response do Express
 */
const gerarToken = (
  user: User,
  req: Request,
  res: Response<TokenResponse | { message: string }>
): Response<TokenResponse | { message: string }> => {
  const requiredProperties: (keyof User)[] = ["id", "login"];
  const missingProperties = requiredProperties.filter((prop) => !user[prop]);

  if (missingProperties.length > 0) {
    return res.status(400).json({
      message: `Dados do usuário incompletos. Faltando: ${missingProperties.join(
        ", "
      )}`,
    });
  }

  try {
    const token = jwt.sign(
      {
        id: user.id,
        login: user.login,
        // nivel_acesso: user.nivel_acesso,
      },
      process.env.SECRET as string,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Você está autenticado!",
      token,
      data: {
        id: user.id,
        login: user.login,
        // nivel_acesso: user.nivel_acesso,
      },
    });
  } catch (error) {
    console.error("Erro ao criar o token:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return res.status(500).json({
      message: `Erro interno ao gerar o token: ${errorMessage}`,
    });
  }
};

export default gerarToken;
