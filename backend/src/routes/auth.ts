import { Router, Request, Response, NextFunction } from 'express';
import * as auth from '../lib/auth';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, ConflictError, BadRequestError } from '../lib/errors';

const router = Router();

// ── POST /api/auth/register ───────────────────────────────────────
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, avatarUrl } = req.body as {
      email: string;
      password: string;
      name: string;
      avatarUrl?: string;
    };

    if (!email || !password || !name) {
      throw new BadRequestError('Email, password, and name are required');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('User already exists');
    }

    const passwordHash = await auth.hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, avatarUrl },
    });

    const token = auth.signToken(user.id);

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          familyId: user.familyId,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new BadRequestError('Invalid email or password');
    }

    const isValid = await auth.comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Invalid email or password');
    }

    const token = auth.signToken(user.id);

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          familyId: user.familyId,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────
router.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        familyId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ data: { user } });
  } catch (error) {
    next(error);
  }
});

export default router;
