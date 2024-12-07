import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { userStatus, userTypes } from "../utils/constants";
import * as v from "valibot";

// role: user | admin | super_admin
export const roleEnum = pgEnum(
	"role",
	Object.values(userTypes) as [string, ...string[]]
);

export const userStatusEnum = pgEnum('status',
	Object.values(userStatus) as ['verified', 'unverified']
);

export const userDbSchema = pgTable("user", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }),
	email: text("email").notNull().unique(),
	phone: text("phone"),
	address: text("address"),
	city: text("city"),
	state: text("state"),
	password: text("password"),
	panCard: text("pan_card"),
	status: userStatusEnum("status").notNull(),
	otp: text("otp"),
	drivingLicense: text("driver_license"),
	role: roleEnum("role"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const insertUserSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
	email: v.pipe(v.string(), v.email()),
	phone: v.string(),
	address: v.string(),
	city: v.string(),
	state: v.string(),
	panCard: v.string(),
	drivingLicense: v.string(),
});