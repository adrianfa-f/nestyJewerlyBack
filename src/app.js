import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import AutoCancelWorker from "./workers/autoCancelWorker.js";

dotenv.config();

const app = express();

const autoCancelWorker = new AutoCancelWorker();
autoCancelWorker.start();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

// Middleware específico para webhooks de Stripe (debe estar antes de express.json)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Middleware para el resto de las rutas
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await autoCancelWorker.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await autoCancelWorker.stop();
  process.exit(0);
});

export default app;
