import { ZodProvider } from "@autoform/zod";
import { z } from "zod";

export const user: User = {
  id: "1",
  name: "John Doe",
  email: "heyjatinn@gmail.com",
  role: "super_admin",
}

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin", "super_admin"]),
})

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