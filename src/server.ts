import "dotenv/config";
import { app } from "./app";
import { prisma } from "./prisma/client";

const PORT = process.env.PORT || 3333;

async function iniciar() {
  try {
    // Conectar ao banco de dados
    await prisma.$connect();
    console.log("✅ Banco de dados conectado");

    app.listen(PORT, () => {
      console.log(`🚀 ProEstoque API rodando em http://localhost:${PORT}`);
      console.log("📊 Prisma Studio: npx prisma studio");
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

iniciar();
