import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../middlewares/errorHandler";

export class ProdutoController {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { busca, categoriaId, apenasAlerta } = req.query;

      const where: any = {};

      if (busca) {
        where.nome = {
          contains: String(busca),
          mode: "insensitive"
        };
      }

      if (categoriaId) {
        where.categoriaId = String(categoriaId);
      }

      if (apenasAlerta === "true") {
        where.quantidade = {
          lt: prisma.produto.fields.quantidadeMinima
        };
      }

      const produtos = await prisma.produto.findMany({
        where,
        include: {
          categoria: true
        },
        orderBy: {
          nome: "asc"
        }
      });

      res.json(produtos);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const produto = await prisma.produto.findUnique({
        where: { id },
        include: {
          categoria: true
        }
      });

      if (!produto) {
        throw new AppError("Produto não encontrado", 404);
      }

      res.json(produto);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        nome,
        categoriaId,
        quantidade,
        quantidadeMinima,
        preco,
        unidade,
        observacao,
        foto
      } = req.body;

      if (!nome || !categoriaId || preco === undefined) {
        throw new AppError("Campos obrigatórios: nome, categoriaId, preco", 400);
      }

      // Verificar se a categoria existe
      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id: categoriaId }
      });

      if (!categoriaExiste) {
        throw new AppError("Categoria não encontrada", 404);
      }

      const produto = await prisma.produto.create({
        data: {
          nome: String(nome).trim(),
          categoriaId: String(categoriaId),
          quantidade: Number(quantidade ?? 0),
          quantidadeMinima: Number(quantidadeMinima ?? 0),
          preco: Number(preco),
          unidade: String(unidade ?? "un"),
          observacao: observacao ? String(observacao) : null,
          foto: foto ? String(foto) : null,
          ultimaMovimentacao: new Date()
        },
        include: {
          categoria: true
        }
      });

      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const {
        nome,
        categoriaId,
        quantidade,
        quantidadeMinima,
        preco,
        unidade,
        observacao,
        foto
      } = req.body;

      // Verificar se o produto existe
      const produtoExiste = await prisma.produto.findUnique({
        where: { id }
      });

      if (!produtoExiste) {
        throw new AppError("Produto não encontrado", 404);
      }

      // Se categoriaId foi informada, verificar se a categoria existe
      if (categoriaId !== undefined) {
        const categoriaExiste = await prisma.categoria.findUnique({
          where: { id: categoriaId }
        });

        if (!categoriaExiste) {
          throw new AppError("Categoria não encontrada", 404);
        }
      }

      // Montar objeto de atualização com spread condicional
      const data: any = {
        ultimaMovimentacao: new Date()
      };

      if (nome !== undefined) data.nome = String(nome).trim();
      if (categoriaId !== undefined) data.categoriaId = String(categoriaId);
      if (quantidade !== undefined) data.quantidade = Number(quantidade);
      if (quantidadeMinima !== undefined) data.quantidadeMinima = Number(quantidadeMinima);
      if (preco !== undefined) data.preco = Number(preco);
      if (unidade !== undefined) data.unidade = String(unidade);
      if (observacao !== undefined) data.observacao = observacao ? String(observacao) : null;
      if (foto !== undefined) data.foto = foto ? String(foto) : null;

      const produtoAtualizado = await prisma.produto.update({
        where: { id },
        data,
        include: {
          categoria: true
        }
      });

      res.json(produtoAtualizado);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      // Verificar se o produto existe
      const produtoExiste = await prisma.produto.findUnique({
        where: { id }
      });

      if (!produtoExiste) {
        throw new AppError("Produto não encontrado", 404);
      }

      await prisma.produto.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
