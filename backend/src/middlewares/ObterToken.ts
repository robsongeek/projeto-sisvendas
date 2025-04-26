import { Request } from 'express';

/**
 * Obtém o token JWT do cabeçalho Authorization da requisição
 * @param req - Objeto Request do Express
 * @returns Token JWT
 * @throws {Error} Se o cabeçalho Authorization estiver ausente ou mal formatado
 */
const obterToken = (req: Request): string => {
  const authHeader: string | undefined = req.headers.authorization;
  
  if (!authHeader) {
    throw new Error("Cabeçalho Authorization ausente");
  }

  const trimmedHeader: string = authHeader.trim();
  const parts: string[] = trimmedHeader.split(/\s+/);

  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new Error("Formato de token inválido. Use: Bearer <token>");
  }

  const token: string = parts[1];
  console.log("Token: back", token);
  
  if (!token) {
    throw new Error("Token ausente após o prefixo Bearer");
  }

  return token;
};

export default obterToken;