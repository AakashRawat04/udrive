import {
  integer,
  json,
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
  year: integer("year").notNull(),
  branch: uuid("branch")
    .references(() => branchDbSchema.id)
    .notNull(),
  regNo: varchar("reg_no", { length: 255 }).notNull(),
  images: json("images").$type<string[]>().notNull(),
  ratePerHour: integer("rate_per_hour").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: varchar("fuel_type", { length: 255 }).notNull(),
  transmission: varchar("transmission", { length: 255 }).notNull(),
  seats: integer("seats").notNull(),
  topSpeed: integer("top_speed").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// car request schema for car request table
// multiple users can request for a car and the admin can update the status of the request to pending, approved or rejected
export const carRequestStatusEnum = pgEnum(
  "car_request_status",
  Object.values(carRequestStatus) as [string, ...string[]],
);

export const carRequestDbSchema = pgTable("car_request", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  car: uuid("car")
    .references(() => carDbSchema.id)
    .notNull(),
  user: uuid("user")
    .references(() => userDbSchema.id)
    .notNull(),
  from: timestamp("from").notNull(),
  to: timestamp("to").notNull(),
  status: carRequestStatusEnum("status").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  bill: numeric("bill"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const carSchema = v.object({
  brand: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  model: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  year: v.number(),
  branch: v.pipe(v.string(), v.uuid()),
  regNo: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  images: v.array(v.string()),
  ratePerHour: v.number(),
  mileage: v.number(),
  fuelType: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  transmission: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  seats: v.number(),
  topSpeed: v.number(),
});

export const imageUploadSchema = v.object({
  image: v.file(),
});

export const updateCarSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  ...carSchema.entries,
});

export const assignCarSchema = v.object({
  carId: v.pipe(v.string(), v.uuid()),
  branchId: v.pipe(v.string(), v.uuid()),
});

export const carRequestSchema = v.object({
  car: v.pipe(v.string(), v.uuid()),
  from: v.pipe(v.string(), v.isoDate()),
  to: v.pipe(v.string(), v.isoDate()),
});

export const updateCarRequestSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  status: v.pipe(v.string(), v.picklist(Object.values(carRequestStatus))),
});

export const startCarJourneySchema = v.object({
  carRequestId: v.pipe(v.string(), v.uuid()),
});

export const endCarJourneySchema = v.object({
  carRequestId: v.pipe(v.string(), v.uuid()),
  bill: v.number(),
});

export const cancelCarJourneySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});

export const updateCarJourneySchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  car: v.pipe(v.string(), v.uuid()),
  user: v.pipe(v.string(), v.uuid()),
  startTime: v.optional(v.pipe(v.string(), v.isoDate())),
  endTime: v.optional(v.pipe(v.string(), v.isoDate())),
  finalPrice: v.optional(v.string()),
});
