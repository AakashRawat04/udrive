import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import * as v from "valibot";
import { carDbSchema } from "./car";
import { user } from "./user";

export const ratingDbSchema = pgTable("rating", {
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

export const ratingSchema = v.object({
	car: v.pipe(v.string(), v.uuid()),
	user: v.pipe(v.string(), v.uuid()),
	rating: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
	comment: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});

export const updateRatingSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	car: v.pipe(v.string(), v.uuid()),
	user: v.pipe(v.string(), v.uuid()),
	rating: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
	comment: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});
