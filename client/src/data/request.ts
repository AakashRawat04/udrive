import { z } from "zod";

export const enum RequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Cancelled = "cancelled",
  Started = "started",
  Completed = "completed",
  Transferred = "transferred",
}

export const carRequestSchema = z.object({
  id: z.string().uuid(),
  branch: z.string().uuid(),
  car: z.string().uuid(),
  user: z.string().uuid(),
  from: z.date(),
  to: z.date(),
  startTime: z.date().optional(),
  status: z.enum([
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "started",
    "completed",
    "transferred",
  ]),
  endTime: z.date().optional(),
  bill: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type CarRequest = z.infer<typeof carRequestSchema>;
