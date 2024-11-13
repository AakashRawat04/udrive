import { ZodProvider } from "@autoform/zod";
import { z } from "zod";

export const branch: Branch = {
  id: "1",
  name: "Branch 1",
  address: "Address 1",
  admin: "heyjatinn@gmail.com",
};

export const branchZodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  address: z.string(),
  admin: z.string().uuid(),
});

export const addBranchSchema = z.object({
  name: z.string().max(255),
  address: z.string(),
  admin: z.string().uuid(),
});

export const editBranchSchema = z.object({
  name: z.string().max(255),
  address: z.string(),
  admin: z.string().uuid(),
});

export const addBranchFormSchema = new ZodProvider(addBranchSchema);
export const editBranchFormSchema = new ZodProvider(editBranchSchema);

export type Branch = z.infer<typeof branchZodSchema>;