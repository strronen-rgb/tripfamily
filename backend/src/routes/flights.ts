import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';
import { createFlightSchema, updateFlightSchema } from '../lib/validate';

const router = Router();

// Helper: verify user is a member of the given family
async function assertFamilyMember(userId: string, familyId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw new ForbiddenError('You are not a member of this family');
  }
  return user;
}

// ── POST /api/flights — Create flight ──────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createFlightSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { familyId, airline, flightNumber, departure, arrival, departureTime, arrivalTime, terminal, gate } = parsed.data;
    const userId = req.user!.userId;

    await assertFamilyMember(userId, familyId);

    const flight = await prisma.flight.create({
      data: {
        familyId,
        airline,
        flightNumber,
        departure,
        arrival,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        terminal: terminal ?? null,
        gate: gate ?? null,
        createdBy: userId,
      },
    });

    res.status(201).json({ data: { flight } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/flights?familyId=xxx — List flights for family ───────────────
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.query as { familyId?: string };
    const userId = req.user!.userId;

    if (!familyId) {
      throw new BadRequestError('familyId query parameter is required');
    }

    await assertFamilyMember(userId, familyId);

    const flights = await prisma.flight.findMany({
      where: { familyId },
      orderBy: { departureTime: 'asc' },
    });

    res.json({ data: { flights } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/flights/:id — Get flight details ─────────────────────────────
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const flight = await prisma.flight.findUnique({ where: { id } });

    if (!flight) {
      throw new NotFoundError('Flight not found');
    }

    await assertFamilyMember(userId, flight.familyId);

    res.json({ data: { flight } });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/flights/:id — Update flight ──────────────────────────────────
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.flight.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Flight not found');
    }

    await assertFamilyMember(userId, existing.familyId);

    const parsed = updateFlightSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const updateData: Record<string, unknown> = {};
    const p = parsed.data;

    if (p.airline !== undefined) updateData.airline = p.airline;
    if (p.flightNumber !== undefined) updateData.flightNumber = p.flightNumber;
    if (p.departure !== undefined) updateData.departure = p.departure;
    if (p.arrival !== undefined) updateData.arrival = p.arrival;
    if (p.departureTime !== undefined) updateData.departureTime = new Date(p.departureTime);
    if (p.arrivalTime !== undefined) updateData.arrivalTime = new Date(p.arrivalTime);
    if (p.terminal !== undefined) updateData.terminal = p.terminal;
    if (p.gate !== undefined) updateData.gate = p.gate;
    if (p.status !== undefined) updateData.status = p.status;

    const flight = await prisma.flight.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: { flight } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/flights/:id — Delete flight ───────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.flight.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Flight not found');
    }

    const user = await assertFamilyMember(userId, existing.familyId);

    // Allow delete if user is manager of the family OR the creator of the flight
    const family = await prisma.family.findUnique({ where: { id: existing.familyId } });
    const isManager = family?.managerId === userId;
    const isCreator = existing.createdBy === userId;

    if (!isManager && !isCreator) {
      throw new ForbiddenError('Only the family manager or the flight creator can delete this flight');
    }

    await prisma.flight.delete({ where: { id } });

    res.json({ data: { message: 'Flight deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
