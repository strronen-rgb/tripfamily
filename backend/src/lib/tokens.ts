// In-memory token stores (use Redis in production)

// Password reset codes: email → { code, expires }
export const resetCodes = new Map<string, { code: string; expires: number }>();

// Email verification tokens: email → { token, userId, expires }
export const verificationCodes = new Map<string, { token: string; userId: string; expires: number }>();
