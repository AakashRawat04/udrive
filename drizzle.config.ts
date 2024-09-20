import type { Config } from "drizzle-kit";

export default {
	schema: "./backend/schema/*",
	out: "./backend/drizzle",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.HOST!,
		user: process.env.USER_NAME!,
		password: process.env.PASSWORD!,
		port: Number(process.env.PORT!),
		database: process.env.DATABASE!,
	},
} satisfies Config;
