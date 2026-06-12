import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          erro: "Dados inválidos",
          detalhes: error.issues.map((err) => ({
            campo: err.path.join("."),
            mensagem: err.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}
