import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALPHAVANTAGE_API_KEY: z.string().optional(),
  TRACKED_SYMBOLS: z
    .string()
    .default("AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,JPM,V,MA,JNJ,PG,KO,PEP,XOM"),
  AV_MIN_MS_BETWEEN_CALLS: z.coerce.number().default(12000),
  OVERVIEW_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGIN: z.string().default("http://localhost:3000")
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}


