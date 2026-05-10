import { z } from "zod";

export const registerClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  identifier: z.string().min(3, "Phone or email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerArtisanSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  identifier: z.string().min(3, "Phone or email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  categoryId: z.string().uuid("Category is required"),
});

export const registerSellerSchema = z.object({
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  identifier: z.string().min(3, "Phone or email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerCompanySchema = z.object({
  companyName: z.string().min(3, "Company name must be at least 3 characters"),
  identifier: z.string().min(3, "Phone or email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export const loginSchema = z.object({
  identifier: z.string().min(1, "Identifier required"),
  password: z.string().min(1, "Password required"),
  otpChannel: z.enum(["sms", "email"]).optional(),
});

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});
