import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { auth } from '../lib/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';

const router = Router();

// ── POST /api/families — create family ────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, destinations, startDate, endDate, coverImage } = req.body as {
      name: string;
      destinations?: string[];
      startDate?: string;
      endDate?: string;
      coverImage?: string;
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
        coverImage: coverImage || undefined,
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
          status: family.status,
          coverImage: family.coverImage,
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
          status: family.status,
          coverImage: family.coverImage,
          users: family.users,
          createdAt: family.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/families/:id — update family (manager only) ───────────
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, destinations, startDate, endDate, status, coverImage } = req.body as {
      name?: string;
      destinations?: string[];
      startDate?: string;
      endDate?: string;
      status?: string;
      coverImage?: string;
    };

    const family = await prisma.family.findUnique({ where: { id } });

    if (!family) {
      throw new NotFoundError('Family not found');
    }

    if (family.managerId !== userId) {
      throw new ForbiddenError('Only the family manager can update the family');
    }

    const updatedFamily = await prisma.family.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(destinations !== undefined && { destinations }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(status !== undefined && { status }),
        ...(coverImage !== undefined && { coverImage }),
      },
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

    res.json({
      data: {
        family: {
          id: updatedFamily.id,
          name: updatedFamily.name,
          inviteCode: updatedFamily.inviteCode,
          managerId: updatedFamily.managerId,
          destinations: updatedFamily.destinations,
          startDate: updatedFamily.startDate,
          endDate: updatedFamily.endDate,
          status: updatedFamily.status,
          coverImage: updatedFamily.coverImage,
          users: updatedFamily.users,
          createdAt: updatedFamily.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/families/:id/duplicate — duplicate a family ─────────
router.post('/:id/duplicate', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const original = await prisma.family.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!original) {
      throw new NotFoundError('Family not found');
    }

    // Check user is a member
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.familyId !== id) {
      throw new ForbiddenError('You must be a member to duplicate this family');
    }

    // Generate new invite code
    let finalCode = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      finalCode = auth.generateInviteCode();
      const existing = await prisma.family.findUnique({ where: { inviteCode: finalCode } });
      if (!existing) break;
    }

    const newFamily = await prisma.family.create({
      data: {
        name: `${original.name} (העתק)`,
        destinations: original.destinations,
        startDate: original.startDate,
        endDate: original.endDate,
        status: 'planning',
        coverImage: original.coverImage,
        inviteCode: finalCode,
        managerId: userId,
        users: {
          connect: { id: userId },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { familyId: newFamily.id, role: 'MANAGER' },
    });

    res.status(201).json({
      data: {
        family: {
          id: newFamily.id,
          name: newFamily.name,
          inviteCode: newFamily.inviteCode,
          managerId: newFamily.managerId,
          destinations: newFamily.destinations,
          startDate: newFamily.startDate,
          endDate: newFamily.endDate,
          status: newFamily.status,
          coverImage: newFamily.coverImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/families/:id — delete family (manager only) ────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const family = await prisma.family.findUnique({ where: { id } });

    if (!family) {
      throw new NotFoundError('Family not found');
    }

    if (family.managerId !== userId) {
      throw new ForbiddenError('Only the family manager can delete the family');
    }

    // Unlink all members first
    await prisma.user.updateMany({
      where: { familyId: id },
      data: { familyId: null, role: 'VIEWER' },
    });

    await prisma.family.delete({ where: { id } });

    res.json({ data: { message: 'Family deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/families/my — get current user's family ───────────────
router.get('/my', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.familyId) {
      throw new NotFoundError('You are not in a family');
    }

    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
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
          status: family.status,
          coverImage: family.coverImage,
          users: family.users,
          createdAt: family.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/families/leave — leave current family ────────────────
router.post('/leave', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.familyId) {
      throw new BadRequestError('You are not in a family');
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });

    // If the leaving user is the manager and there are other members,
    // transfer ownership to the oldest member
    if (family && family.managerId === userId) {
      const otherMembers = await prisma.user.findMany({
        where: { familyId: family.id, NOT: { id: userId } },
        orderBy: { createdAt: 'asc' },
        take: 1,
      });

      if (otherMembers.length > 0) {
        await prisma.family.update({
          where: { id: family.id },
          data: { managerId: otherMembers[0].id },
        });
        await prisma.user.update({
          where: { id: otherMembers[0].id },
          data: { role: 'MANAGER' },
        });
      } else {
        // No other members — delete the family
        await prisma.family.delete({ where: { id: family.id } });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { familyId: null, role: 'VIEWER' },
    });

    res.json({
      data: {
        message: 'Left family successfully',
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

// ── DELETE /api/families/members/:memberId — remove member (manager only) ──
router.delete('/members/:memberId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const userId = req.user!.userId;

    // Look up the acting user's family
    const actingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!actingUser?.familyId) {
      throw new NotFoundError('You are not in a family');
    }

    const family = await prisma.family.findUnique({ where: { id: actingUser.familyId } });

    if (!family) {
      throw new NotFoundError('Family not found');
    }

    if (family.managerId !== userId) {
      throw new ForbiddenError('Only the family manager can remove members');
    }

    if (memberId === userId) {
      throw new BadRequestError('You cannot remove yourself; use /leave instead');
    }

    const member = await prisma.user.findUnique({ where: { id: memberId } });

    if (!member || member.familyId !== family.id) {
      throw new NotFoundError('Member not found in your family');
    }

    await prisma.user.update({
      where: { id: memberId },
      data: { familyId: null, role: 'VIEWER' },
    });

    res.json({ data: { message: 'Member removed successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
