import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';

const router = Router();

// ── GET /api/timeline?familyId=xxx — Get chronological timeline ──────────
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.query as { familyId?: string };
    const userId = req.user!.userId;

    if (!familyId) {
      throw new BadRequestError('familyId query parameter is required');
    }

    // Verify user is a member of the family
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.familyId !== familyId) {
      throw new ForbiddenError('You are not a member of this family');
    }

    // Fetch all three entity types
    const [flights, hotels, attractions] = await Promise.all([
      prisma.flight.findMany({
        where: { familyId },
        orderBy: { departureTime: 'asc' },
      }),
      prisma.hotel.findMany({
        where: { familyId },
        orderBy: { checkIn: 'asc' }),
      }),
      prisma.attraction.findMany({
        where: { familyId },
        orderBy: { visitDate: 'asc' },
      }),
    ]);

    // Build unified timeline items
    const timelineItems: Array<{
      type: 'flight' | 'hotel' | 'attraction';
      date: string;
      sortKey: number;
      data: Record<string, unknown>;
    }> = [];

    for (const flight of flights) {
      timelineItems.push({
        type: 'flight',
        date: flight.departureTime.toISOString(),
        sortKey: flight.departureTime.getTime(),
        data: {
          id: flight.id,
          familyId: flight.familyId,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departure: flight.departure,
          arrival: flight.arrival,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          terminal: flight.terminal,
          gate: flight.gate,
          status: flight.status,
          createdBy: flight.createdBy,
          createdAt: flight.createdAt,
        },
      });
    }

    for (const hotel of hotels) {
      timelineItems.push({
        type: 'hotel',
        date: hotel.checkIn.toISOString(),
        sortKey: hotel.checkIn.getTime(),
        data: {
          id: hotel.id,
          familyId: hotel.familyId,
          name: hotel.name,
          address: hotel.address,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          bookingRef: hotel.bookingRef,
          price: hotel.price,
          currency: hotel.currency,
          status: hotel.status,
          createdBy: hotel.createdBy,
          createdAt: hotel.createdAt,
        },
      });
    }

    for (const attraction of attractions) {
      // Skip attractions without a visit date — they can't be placed on the timeline
      if (!attraction.visitDate) continue;

      timelineItems.push({
        type: 'attraction',
        date: attraction.visitDate.toISOString(),
        sortKey: attraction.visitDate.getTime(),
        data: {
          id: attraction.id,
          familyId: attraction.familyId,
          name: attraction.name,
          type: attraction.type,
          location: attraction.location,
          visitDate: attraction.visitDate,
          ticketPrice: attraction.ticketPrice,
          bookingRef: attraction.bookingRef,
          notes: attraction.notes,
          createdBy: attraction.createdBy,
          createdAt: attraction.createdAt,
        },
      });
    }

    // Sort by date ascending (chronological)
    timelineItems.sort((a, b) => a.sortKey - b.sortKey);

    // Remove the internal sortKey before sending response
    const items = timelineItems.map(({ sortKey: _skip, ...rest }) => rest);

    res.json({ data: { items, total: items.length } });
  } catch (error) {
    next(error);
  }
});

export default router;
