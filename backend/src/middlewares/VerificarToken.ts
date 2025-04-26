import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import obterToken from './ObterToken';
import path from 'path';

require('dotenv-safe').config({ path: path.resolve(__dirname, '../.env') });

// Interface para o payload do token
interface UserPayload {
  id: string | number;
  name: string;
  access_level: string;
  id_employee: string | number;
}

// Extensão da interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      message: 'Acesso Negado! O header Authorization está faltando.'
    });
  }

  try {
    const token = obterToken(req);
    const verified = jwt.verify(token, process.env.SECRET as string) as UserPayload;
    
    req.user = verified;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Sessão expirada. Faça login novamente para continuar.'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        message: 'Token inválido. Por favor, faça login novamente.'
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro na autenticação';
    return res.status(401).json({
      message: `Erro no token de acesso: ${errorMessage}`
    });
  }
};

export default verifyToken;