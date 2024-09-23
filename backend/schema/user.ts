import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	role: text("role").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
