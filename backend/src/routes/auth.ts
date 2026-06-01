import { Router, Request, Response, NextFunction } from 'express';
import * as auth from '../lib/auth';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { ConflictError, BadRequestError, NotFoundError } from '../lib/errors';
import { registerSchema, loginSchema } from '../lib/validate';


const router = Router();

// ── POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('User already exists');

    const passwordHash = await auth.hashPassword(password);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    const token = auth.signToken(user.id);

    // Email verification (commented out until email service configured)
    // const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
    // let verifyToken = '';
    // for (let i = 0; i < 32; i++) {
    //   verifyToken += chars.charAt(Math.floor(Math.random() * chars.length));
    // }
    // verificationCodes.set(user.email, { token: verifyToken, userId: user.id, expires: Date.now() + 60 * 60 * 1000 });
    // const baseUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    // const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;
    // sendVerificationEmail(user.email, user.name, verifyUrl).catch(() => {});

    res.status(201).json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role, familyId: user.familyId },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new BadRequestError('Invalid email or password');

    const isValid = await auth.comparePassword(password, user.passwordHash);
    if (!isValid) throw new BadRequestError('Invalid email or password');

    const token = auth.signToken(user.id);
    res.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role, familyId: user.familyId },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, role: true, familyId: true, createdAt: true },
    });
    if (!user) throw new BadRequestError('User not found');
    res.json({ data: { user } });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/reset-password — request reset code ─────────────
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) throw new BadRequestError('Email is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      res.json({ data: { message: 'If the email exists, a reset code has been sent' } });
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, { code, expires: Date.now() + 30 * 60 * 1000 }); // 30 min

    // In production: send email here. For now, return code in response for testing.
    console.log(`[RESET CODE] ${email}: ${code}`);
    res.json({
      data: {
        message: 'If the email exists, a reset code has been sent',
        // Remove in production:
        code,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/reset-password/verify — verify reset code ──────
router.post('/reset-password/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    if (!email || !code) throw new BadRequestError('Email and code are required');

    const stored = resetCodes.get(email);
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      throw new BadRequestError('Invalid or expired code');
    }

    res.json({ data: { message: 'Code verified' } });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/reset-password/confirm — set new password ──────
router.post('/reset-password/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, password } = req.body as { email: string; code: string; password: string };
    if (!email || !code || !password) throw new BadRequestError('Email, code, and password are required');
    if (password.length < 6) throw new BadRequestError('Password must be at least 6 characters');

    const stored = resetCodes.get(email);
    if (!stored || stored.code !== code || Date.now() > stored.expires) {
      throw new BadRequestError('Invalid or expired code');
    }

    const passwordHash = await auth.hashPassword(password);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    resetCodes.delete(email);
    res.json({ data: { message: 'Password updated successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
