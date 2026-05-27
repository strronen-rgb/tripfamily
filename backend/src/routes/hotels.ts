import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';
import { createHotelSchema, updateHotelSchema } from '../lib/validate';

const router = Router();

// Helper: verify user is a member of the given family
async function assertFamilyMember(userId: string, familyId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw new ForbiddenError('You are not a member of this family');
  }
  return user;
}

// ── POST /api/hotels — Create hotel booking ───────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createHotelSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { familyId, name, address, checkIn, checkOut, bookingRef, price, currency } = parsed.data;
    const userId = req.user!.userId;

    await assertFamilyMember(userId, familyId);

    const hotel = await prisma.hotel.create({
      data: {
        familyId,
        name,
        address: address ?? null,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        bookingRef: bookingRef ?? null,
        price: price ?? null,
        currency: currency ?? 'USD',
        createdBy: userId,
      },
    });

    res.status(201).json({ data: { hotel } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/hotels?familyId=xxx — List hotels for family ────────────────
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.query as { familyId?: string };
    const userId = req.user!.userId;

    if (!familyId) {
      throw new BadRequestError('familyId query parameter is required');
    }

    await assertFamilyMember(userId, familyId);

    const hotels = await prisma.hotel.findMany({
      where: { familyId },
      orderBy: { checkIn: 'asc' },
    });

    res.json({ data: { hotels } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/hotels/:id — Get hotel details ───────────────────────────────
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const hotel = await prisma.hotel.findUnique({ where: { id } });

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    await assertFamilyMember(userId, hotel.familyId);

    res.json({ data: { hotel } });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/hotels/:id — Update hotel booking ────────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Hotel not found');
    }

    await assertFamilyMember(userId, existing.familyId);

    const parsed = updateHotelSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const updateData: Record<string, unknown> = {};
    const p = parsed.data;

    if (p.name !== undefined) updateData.name = p.name;
    if (p.address !== undefined) updateData.address = p.address;
    if (p.checkIn !== undefined) updateData.checkIn = new Date(p.checkIn);
    if (p.checkOut !== undefined) updateData.checkOut = new Date(p.checkOut);
    if (p.bookingRef !== undefined) updateData.bookingRef = p.bookingRef;
    if (p.price !== undefined) updateData.price = p.price;
    if (p.currency !== undefined) updateData.currency = p.currency;
    if (p.status !== undefined) updateData.status = p.status;

    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: { hotel } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/hotels/:id — Delete hotel ─────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Hotel not found');
    }

    const user = await assertFamilyMember(userId, existing.familyId);

    const family = await prisma.family.findUnique({ where: { id: existing.familyId } });
    const isManager = family?.managerId === userId;
    const isCreator = existing.createdBy === userId;

    if (!isManager && !isCreator) {
      throw new ForbiddenError('Only the family manager or the hotel creator can delete this booking');
    }

    await prisma.hotel.delete({ where: { id } });

    res.json({ data: { message: 'Hotel booking deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
