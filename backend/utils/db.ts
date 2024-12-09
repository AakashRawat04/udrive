import { drizzle } from "drizzle-orm/postgres-js";
import process from "node:process";
import postgres from "postgres";

export const db = drizzle(
  postgres({
    host: process.env.HOST!,
    user: process.env.USER_NAME!,
    password: process.env.PASSWORD!,
    port: Number(process.env.PORT!),
    database: process.env.DATABASE!,
  }),
);
