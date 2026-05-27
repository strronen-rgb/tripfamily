import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  avatarUrl: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('אימייל לא תקין'),
  password: z.string().min(1, 'סיסמה נדרשת'),
});

export const createFamilySchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  destinations: z.array(z.string()).min 1, 'יש לבחור לפחות יעד אחד'),
});

export const joinFamilySchema = z.object({
  inviteCode: z.string().length(6, 'קוד הזמנה חייב להכיל 6 תווים'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
