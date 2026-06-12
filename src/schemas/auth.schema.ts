import { z } from "zod";

export const registroSchema = z.object({
  nome: z.string().trim().min(2, { message: "O nome deve ter no mínimo 2 caracteres" }),
  email: z.string().trim().email({ message: "E-mail inválido" }).toLowerCase(),
  senha: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }).max(72, { message: "A senha deve ter no máximo 72 caracteres" })
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).toLowerCase(),
  senha: z.string().min(1, { message: "A senha é obrigatória" })
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
