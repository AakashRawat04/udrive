import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import process from "node:process";
import postgres from "postgres";
import drizzleConfig from "../drizzle.config";

async function main() {
	// generate db url from host user password port and database
	// encode password to avoid special characters
	const password = encodeURIComponent(process.env.PASSWORD!);
	const dbUrl = `postgresql://${process.env.USER_NAME}:${password}@${process.env.HOST}:${process.env.PORT}/${process.env.DATABASE}`;
	const connection = postgres(dbUrl, { max: 1 });

	// This will run migrations on the database, skipping the ones already applied
	await migrate(drizzle(connection), { migrationsFolder: drizzleConfig.out });

	// Don't forget to close the connection, otherwise the script will hang
	await connection.end();
}

main();
