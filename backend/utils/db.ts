import { drizzle } from "drizzle-orm/postgres-js";
import process from "node:process";
import postgres from "postgres";
import { getDbCredentials } from "./getDbCredentials";

const dbCred = await getDbCredentials();

export const db = drizzle(
	postgres({
		host: process.env.HOST!,
		user: dbCred.username,
		password: dbCred.password,
		port: Number(process.env.PORT!),
		database: process.env.DATABASE!,
	})
);
