import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Logger simples para ambiente de desenvolvimento
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Rota de Healthcheck
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "ProEstoque API",
    versao: "1.0.0"
  });
});

// Rotas da API
app.use("/api", router);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export { app };
