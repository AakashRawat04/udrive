import { z } from "zod";

export const carRequestSchema = z.object({
  id: z.string().uuid(),
  branch: z.string().uuid(),
  car: z.string().uuid(),
  user: z.string().uuid(),
  from: z.date(),
  to: z.date(),
  status: z.enum(["pending", "approved", "rejected"]), // Assuming these are the possible statuses
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type CarRequest = z.infer<typeof carRequestSchema>;