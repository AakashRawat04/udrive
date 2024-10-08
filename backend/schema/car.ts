import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { branch } from "./branch";

export const car = pgTable("car", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	brand: varchar("brand", { length: 255 }).notNull(),
	model: varchar("model", { length: 255 }).notNull(),
	year: varchar("year", { length: 255 }).notNull(),
	branch: uuid("branch")
		.references(() => branch.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
