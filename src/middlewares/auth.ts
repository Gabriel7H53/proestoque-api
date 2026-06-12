import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "./errorHandler";
import { JwtPayload } from "../controllers/auth.controller";

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido", 401);
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      throw new AppError("Formato de token inválido. Use: Bearer <token>", 401);
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme) || !token) {
      throw new AppError("Formato de token inválido. Use: Bearer <token>", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    req.usuario = decoded as JwtPayload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Token expirado. Faça login novamente.", 401));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Token inválido.", 401));
      return;
    }

    next(error);
  }
}
