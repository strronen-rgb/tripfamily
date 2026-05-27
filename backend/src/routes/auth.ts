import { Router, Request, Response, NextFunction } from 'express';
import * as auth from '../lib/auth';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { ConflictError, BadRequestError } from '../lib/errors';
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

export default router;
