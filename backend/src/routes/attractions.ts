import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';
import { createAttractionSchema, updateAttractionSchema } from '../lib/validate';

const router = Router();

// Helper: verify user is a member of the given family
async function assertFamilyMember(userId: string, familyId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw new ForbiddenError('You are not a member of this family');
  }
  return user;
}

// ── POST /api/attractions — Create attraction ──────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createAttractionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { familyId, name, type, location, visitDate, ticketPrice, bookingRef, notes } = parsed.data;
    const userId = req.user!.userId;

    await assertFamilyMember(userId, familyId);

    const attraction = await prisma.attraction.create({
      data: {
        familyId,
        name,
        type,
        location: location ?? null,
        visitDate: visitDate ? new Date(visitDate) : null,
        ticketPrice: ticketPrice ?? null,
        bookingRef: bookingRef ?? null,
        notes: notes ?? null,
        createdBy: userId,
      },
    });

    res.status(201).json({ data: { attraction } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/attractions?familyId=xxx — List attractions for family ──────
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.query as { familyId?: string };
    const userId = req.user!.userId;

    if (!familyId) {
      throw new BadRequestError('familyId query parameter is required');
    }

    await assertFamilyMember(userId, familyId);

    const attractions = await prisma.attraction.findMany({
      where: { familyId },
      orderBy: { visitDate: 'asc' },
    });

    res.json({ data: { attractions } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/attractions/:id — Get attraction details ────────────────────
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const attraction = await prisma.attraction.findUnique({ where: { id } });

    if (!attraction) {
      throw new NotFoundError('Attraction not found');
    }

    await assertFamilyMember(userId, attraction.familyId);

    res.json({ data: { attraction } });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/attractions/:id — Update attraction ─────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.attraction.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Attraction not found');
    }

    await assertFamilyMember(userId, existing.familyId);

    const parsed = updateAttractionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const updateData: Record<string, unknown> = {};
    const p = parsed.data;

    if (p.name !== undefined) updateData.name = p.name;
    if (p.type !== undefined) updateData.type = p.type;
    if (p.location !== undefined) updateData.location = p.location;
    if (p.visitDate !== undefined) updateData.visitDate = p.visitDate ? new Date(p.visitDate) : null;
    if (p.ticketPrice !== undefined) updateData.ticketPrice = p.ticketPrice;
    if (p.bookingRef !== undefined) updateData.bookingRef = p.bookingRef;
    if (p.notes !== undefined) updateData.notes = p.notes;

    const attraction = await prisma.attraction.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: { attraction } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/attractions/:id — Delete attraction ──────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.attraction.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Attraction not found');
    }

    const user = await assertFamilyMember(userId, existing.familyId);

    const family = await prisma.family.findUnique({ where: { id: existing.familyId } });
    const isManager = family?.managerId === userId;
    const isCreator = existing.createdBy === userId;

    if (!isManager && !isCreator) {
      throw new ForbiddenError('Only the family manager or the creator can delete this attraction');
    }

    await prisma.attraction.delete({ where: { id } });

    res.json({ data: { message: 'Attraction deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
