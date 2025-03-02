import { z } from "zod";
import type { FormData } from "../types/types";

export const networkSchema = z.object({
  network: z.number().min(1, "Please select a network"),
});

export const nameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50)
    .trim(),
});

export const symbolSupplySchema = z.object({
  symbol: z
    .string()
    .min(3, "Symbol must be at least 3 characters")
    .max(5, "Symbol must be at most 5 characters")
    .regex(/^[A-Z]+$/, "Symbol must be uppercase letters"),
  supply: z.coerce
    .number()
    .int("Supply must be an integer")
    .positive("Supply must be a positive number"),
});

export const logoSchema = z.object({
  logo: z.string().min(1, "Please generate a logo"),
});
