import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import * as v from "valibot";
import { branchDbSchema } from "./branch";

export const carDbSchema = pgTable("car", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	brand: varchar("brand", { length: 255 }).notNull(),
	model: varchar("model", { length: 255 }).notNull(),
	year: varchar("year", { length: 255 }).notNull(),
	branch: uuid("branch")
		.references(() => branchDbSchema.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const carSchema = v.object({
	brand: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	model: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	year: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	branch: v.pipe(v.string(), v.uuid()),
});

export const updateCarSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	brand: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	model: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	year: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	branch: v.pipe(v.string(), v.uuid()),
});

export const assignCarSchema = v.object({
	carId: v.pipe(v.string(), v.uuid()),
	branchId: v.pipe(v.string(), v.uuid()),
});
