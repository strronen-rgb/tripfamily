import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError } from '../lib/errors';
import { sendVerificationEmail } from '../lib/email';
import { verificationCodes } from '../lib/tokens';

const router = Router();

// Generate a random 32-char token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Build verification URL
function buildVerifyUrl(token: string): string {
  const baseUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
}

// ── POST /api/auth/verify/send-verification
router.post('/send-verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) throw new BadRequestError('Email is required');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.json({ data: { message: 'If the email exists, a verification link has been sent' } });
      return;
    }

    // Rate limit: reuse existing token if still valid
    const existing = verificationCodes.get(user.email);
    if (existing && existing.expires > Date.now()) {
      const sent = await sendVerificationEmail(user.email, user.name, buildVerifyUrl(existing.token));
      res.json({ data: { message: 'Verification email sent', sent } });
      return;
    }

    // Create new token (valid 1 hour)
    const token = generateToken();
    verificationCodes.set(user.email, {
      token,
      userId: user.id,
      expires: Date.now() + 60 * 60 * 1000,
    });

    const sent = await sendVerificationEmail(user.email, user.name, buildVerifyUrl(token));
    res.json({ data: { message: 'Verification email sent', sent } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/verify/verify-email?token=xxx
router.get('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string | undefined;
    if (!token) throw new BadRequestError('Verification token is required');

    let foundEmail: string | null = null;
    for (const [email, data] of verificationCodes.entries()) {
      if (data.token === token) {
        foundEmail = email;
        break;
      }
    }

    if (!foundEmail) throw new BadRequestError('Invalid verification token');

    const stored = verificationCodes.get(foundEmail)!;
    if (stored.expires < Date.now()) {
      verificationCodes.delete(foundEmail);
      throw new BadRequestError('Verification token has expired');
    }

    verificationCodes.delete(foundEmail);

    res.json({
      data: { message: 'Email verified successfully', email: foundEmail },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
