import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3),
    avatarUrl: z.string().url().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const profileSchema = z.object({
  username: z.string().min(3),
});
