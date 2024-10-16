import {
	numeric,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import * as v from "valibot";
import { carRequestStatus } from "../utils/constants";
import { branchDbSchema } from "./branch";
import { userDbSchema } from "./user";

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

// car request schema for car request table
// multiple users can request for a car and the admin can update the status of the request to pending, approved or rejected
const carRequestStatusEnum = pgEnum(
	"car_request_status",
	Object.values(carRequestStatus) as [string, ...string[]]
);

export const carRequestDbSchema = pgTable("car_request", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	branch: uuid("branch")
		.references(() => branchDbSchema.id)
		.notNull(),
	car: uuid("car")
		.references(() => carDbSchema.id)
		.notNull(),
	user: uuid("user")
		.references(() => userDbSchema.id)
		.notNull(),
	from: timestamp("from").notNull(),
	to: timestamp("to").notNull(),
	status: carRequestStatusEnum("status").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const carJourneyDbSchema = pgTable("car_journey", {
	id: uuid("id").notNull().primaryKey().defaultRandom(),
	car: uuid("car")
		.references(() => carDbSchema.id)
		.notNull(),
	user: uuid("user")
		.references(() => userDbSchema.id)
		.notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time"),
	finalPrice: numeric("final_price"),
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

export const carRequestSchema = v.object({
	branch: v.pipe(v.string(), v.uuid()),
	car: v.pipe(v.string(), v.uuid()),
	user: v.pipe(v.string(), v.uuid()),
	from: v.date(),
	to: v.date(),
});

export const updateCarRequestSchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	car: v.pipe(v.string(), v.uuid()),
	status: v.pipe(v.string(), v.picklist(Object.values(carRequestStatus))),
});

export const startCarJourneySchema = v.object({
	car: v.pipe(v.string(), v.uuid()),
	user: v.pipe(v.string(), v.uuid()),
	startTime: v.date(),
});

export const endCarJourneySchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	endTime: v.date(),
});

export const updateCarJourneySchema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	car: v.pipe(v.string(), v.uuid()),
	user: v.pipe(v.string(), v.uuid()),
	startTime: v.optional(v.date()),
	endTime: v.optional(v.date()),
	finalPrice: v.optional(v.string()),
});
