import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError } from '../lib/errors';
import { sendVerificationEmail } from '../lib/email';

const router = Router();

// Generate a random 32-char hex token
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

// ── POST /api/auth/send-verification
// Resend verification email (requires authenticated user or email)
router.post('/send-verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) throw new BadRequestError('Email is required');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if email exists
      res.json({ data: { message: 'If the email exists, a verification link has been sent' } });
      return;
    }

    // Don't allow re-verification
    if (user.emailVerified) {
      res.json({ data: { message: 'Email already verified' } });
      return;
    }

    // Rate limit: reuse existing token if still valid (expires in 1 hour)
    const existing = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (existing && existing.expiresAt > new Date()) {
      // Re-send the existing token
      const sent = await sendVerificationEmail(user.email, user.name, buildVerifyUrl(existing.token));
      res.json({
        data: {
          message: 'Verification email sent',
          sent,
        },
      });
      return;
    }

    // Delete old tokens for this user
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

    // Create new token (valid 1 hour)
    const token = generateToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const sent = await sendVerificationEmail(user.email, user.name, buildVerifyUrl(token));

    res.json({
      data: {
        message: 'Verification email sent',
        sent,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/verify-email?token=xxx
// Verify email with token from link
router.get('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string | undefined;
    if (!token) throw new BadRequestError('Verification token is required');

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) throw new BadRequestError('Invalid verification token');
    if (record.expiresAt < new Date()) throw new BadRequestError('Verification token has expired');

    // Mark user as verified
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    // Delete all verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } });

    // Return success — frontend will show confirmation
    res.json({
      data: {
        message: 'Email verified successfully',
        email: record.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/verification-status?email=xxx
// Check if user's email is verified
router.get('/verification-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string | undefined;
    if (!email) throw new BadRequestError('Email is required');

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      res.json({ data: { emailVerified: false } });
      return;
    }

    res.json({ data: { emailVerified: user.emailVerified } });
  } catch (error) {
    next(error);
  }
});

export default router;
