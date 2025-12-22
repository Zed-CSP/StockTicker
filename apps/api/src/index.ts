import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import pino from "pino";
import pinoHttp from "pino-http";
import { getEnv } from "./env.js";
import rateLimit from "express-rate-limit";
import { stocksRouter } from "./routes/stocks.js";

const env = getEnv();
const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json({ limit: "256kb" }));
app.use((pinoHttp as unknown as (opts: unknown) => unknown)({ logger }) as any);
app.use(morgan("tiny"));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/stocks", stocksRouter);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "API listening");
});


