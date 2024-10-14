import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { carDbSchema } from "./car";
import { user } from "./user";

export const rating = pgTable("rating", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	car: uuid("car")
		.references(() => carDbSchema.id)
		.notNull(),
	user: uuid("user")
		.references(() => user.id)
		.notNull(),
	rating: integer("rating").notNull(),
	comment: text("comment").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
