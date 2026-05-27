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

// ── Flight schemas ──────────────────────────────────────────────────────────
export const createFlightSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  airline: z.string().min(1, 'Airline is required'),
  flightNumber: z.string().min(1, 'Flight number is required'),
  departure: z.string().min(1, 'Departure is required'),
  arrival: z.string().min(1, 'Arrival is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  terminal: z.string().optional(),
  gate: z.string().optional(),
});

export const updateFlightSchema = z.object({
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  departure: z.string().optional(),
  arrival: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  terminal: z.string().optional().nullable(),
  gate: z.string().optional().nullable(),
  status: z.string().optional(),
});

// ── Hotel schemas ───────────────────────────────────────────────────────────
export const createHotelSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  name: z.string().min(1, 'Hotel name is required'),
  address: z.string().optional(),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  bookingRef: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

export const updateHotelSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional().nullable(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  bookingRef: z.string().optional().nullable(),
  price: z.number().positive().optional().nullable(),
  currency: z.string().length(3).optional(),
  status: z.string().optional(),
});

// ── Attraction schemas ─────────────────────────────────────────────────────
export const createAttractionSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  name: z.string().min(1, 'Attraction name is required'),
  type: z.string().min(1, 'Attraction type is required'),
  location: z.string().optional(),
  visitDate: z.string().optional(),
  ticketPrice: z.number().positive().optional(),
  bookingRef: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAttractionSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional().nullable(),
  visitDate: z.string().optional().nullable(),
  ticketPrice: z.number().positive().optional().nullable(),
  bookingRef: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
export type CreateFlightInput = z.infer<typeof createFlightSchema>;
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type CreateAttractionInput = z.infer<typeof createAttractionSchema>;
export type UpdateAttractionInput = z.infer<typeof updateAttractionSchema>;
