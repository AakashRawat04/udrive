import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";

export const branch = pgTable("branch", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	address: text("address").notNull(),
	admin: uuid("admin")
		.references(() => user.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
