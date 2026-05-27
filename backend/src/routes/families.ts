import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { auth } from '../lib/auth';
import { NotFoundError, BadRequestError } from '../lib/errors';

const router = Router();

// ── POST /api/families — create family ────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, destinations, startDate, endDate } = req.body as {
      name: string;
      destinations?: string[];
      startDate?: string;
      endDate?: string;
    };
    const userId = req.user!.userId;

    if (!name) {
      throw new BadRequestError('Family name is required');
    }

    // Generate a unique invite code
    let finalCode = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      finalCode = auth.generateInviteCode();
      const existing = await prisma.family.findUnique({ where: { inviteCode: finalCode } });
      if (!existing) break;
    }

    const family = await prisma.family.create({
      data: {
        name,
        destinations: destinations || [],
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        inviteCode: finalCode,
        managerId: userId,
        users: {
          connect: { id: userId },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { familyId: family.id, role: 'MANAGER' },
    });

    res.status(201).json({
      data: {
        family: {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
          managerId: family.managerId,
          destinations: family.destinations,
          startDate: family.startDate,
          endDate: family.endDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/families/join — join via invite code ────────────────
router.post('/join', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inviteCode } = req.body as { inviteCode: string };
    const userId = req.user!.userId;

    if (!inviteCode) {
      throw new BadRequestError('Invite code is required');
    }

    const family = await prisma.family.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!family) {
      throw new NotFoundError('Invite code is not valid');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { familyId: family.id, role: 'MEMBER' },
    });

    res.json({
      data: {
        family: {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
        },
        user: {
          id: updatedUser.id,
          role: updatedUser.role,
          familyId: updatedUser.familyId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/families/:id — get family details ────────────────────
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundError('Family not found');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.familyId !== id) {
      throw new NotFoundError('Family not found');
    }

    res.json({
      data: {
        family: {
          id: family.id,
          name: family.name,
          inviteCode: family.inviteCode,
          managerId: family.managerId,
          destinations: family.destinations,
          startDate: family.startDate,
          endDate: family.endDate,
          users: family.users,
          createdAt: family.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
