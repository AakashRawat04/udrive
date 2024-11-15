import { z } from "zod";

export const car: Car = {
  id: "1",
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  regNo: "JH 05AC 1234",
  images: [
    "https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?q=80&w=1920&h=1080&auto=format&fit=crop",
    "https://plus.unsplash.com/premium_photo-1683134240084-ba074973f75e?q=80&w=1920&h=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1920&h=1080&auto=format&fit=crop",
  ],
  ratePerHour: 360,
  rating: 4,
  mileage: 14,
  fuelType: "Petrol",
  transmission: "Automatic",
  seats: 5,
  topSpeed: 180,
  branch: "Downtown",
};

export const carSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().min(1900).max(new Date().getFullYear()),
  regNo: z.string(),
  images: z.array(z.string().url()),
  ratePerHour: z.number(),
  rating: z.number(),
  mileage: z.number(),
  fuelType: z.enum(["Petrol", "Diesel", "Electric"]),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.number(),
  topSpeed: z.number(),
  branch: z.string(),
});

export const addCarSchema = z.object({
  id: z.string().optional(),
  brand: z.string(),
  model: z.string(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  regNo: z.string().length(10),
  images: z.array(z.string().url()).min(1),
  ratePerHour: z.coerce.number().min(0),
  mileage: z.coerce.number().min(0),
  branch: z.string(),
  fuelType: z.enum(["Petrol", "Diesel", "Electric"]),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.coerce.number().min(1).max(10),
  topSpeed: z.coerce.number().min(0),
});

export type Car = z.infer<typeof carSchema>;
