import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import * as v from "valibot";
import { user } from "./user";

export const branchDbSchema = pgTable("branch", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	address: text("address").notNull(),
	admin: uuid("admin")
		.references(() => user.id)
		.notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const branchSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	address: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	admin: v.pipe(v.string(), v.uuid()),
});

export const updateBranchSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	address: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	admin: v.pipe(v.string(), v.uuid()),
});

export const assignBranchSchema = v.object({
	branchId: v.pipe(v.string(), v.uuid()),
	userId: v.pipe(v.string(), v.uuid()),
});
