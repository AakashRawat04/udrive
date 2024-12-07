import { ZodProvider } from "@autoform/zod";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  panCard: z.string().optional(),
  drivingLicense: z.string().optional(),
  password: z.string(),
  role: z.enum(["user", "admin", "super_admin"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const newUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export const editUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
})

export const newUserFormSchema = new ZodProvider(newUserSchema);
export const editUserFormSchema = new ZodProvider(editUserSchema);
export type User = z.infer<typeof userSchema>;
export type NewUser = z.infer<typeof newUserSchema>;
export type EditUser = z.infer<typeof editUserSchema>;

export const hasCompletedOnboarding = (user: User) => {
  return user.name && user.phone && user.address && user.city && user.state && user.panCard && user.drivingLicense;
}