import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { userTypes } from "../utils/constants";
import * as v from "valibot";

// role: user | admin | super_admin
export const roleEnum = pgEnum(
	"role",
	Object.values(userTypes) as [string, ...string[]]
);

export const userDbSchema = pgTable("user", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	email: text("email").notNull().unique(),
	phone: text("phone"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	pincode: text("pincode"),
	password: text("password").notNull(),
	role: roleEnum("role").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const insertUserSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	email: v.pipe(v.string(), v.email()),
	phone: v.optional(v.string()),
	address: v.optional(v.string()),
	city: v.optional(v.string()),
	state: v.optional(v.string()),
	pincode: v.optional(v.string()),
});