import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number');

export const nameSchema = z.string().min(1, 'Required').max(64, 'Too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; value: T } | { ok: false; message: string } {
  const res = schema.safeParse(data);
  if (res.success) return { ok: true, value: res.data };
  const message = res.error.issues[0]?.message ?? 'Invalid input';
  return { ok: false, message };
}