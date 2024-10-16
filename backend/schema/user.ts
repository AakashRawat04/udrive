import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { userTypes } from "../utils/constants";

// role: user | admin | super_admin
export const roleEnum = pgEnum(
	"role",
	Object.values(userTypes) as [string, ...string[]]
);

export const userDbSchema = pgTable("user", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	role: roleEnum("role").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
