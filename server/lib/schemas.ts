import { z } from "zod";

export const registerClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^0[567]\d{8}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  otpChannel: z.enum(["sms", "email"]),
});

export const registerArtisanSchema = z.object({
  name: z.string().min(3),
  phone: z.string().regex(/^0[567]\d{8}$/),
  email: z.string().email(),
  password: z.string().min(6),
  categoryId: z.string().uuid(),
  bio: z.string().optional(),
  profilePicture: z.string().url().optional().or(z.literal("")),
  idDocument: z.string().min(1, "ID document required"),
  videoUrl: z.string().url().optional().or(z.literal("")),
  skills: z.string().optional(),
  professionalLicense: z.string().optional(),
  otpChannel: z.enum(["sms", "email"]),
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
