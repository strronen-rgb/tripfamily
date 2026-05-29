import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { NotFoundError, BadRequestError, ForbiddenError } from '../lib/errors';
import { createExpenseSchema, updateExpenseSchema } from '../lib/validate';

const router = Router();

// Helper: verify user is a member of the given family
async function assertFamilyMember(userId: string, familyId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.familyId !== familyId) {
    throw new ForbiddenError('You are not a member of this family');
  }
  return user;
}

// ── POST /api/budget — Create expense ──────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { familyId, category, amount, currency, description, receiptUrl, paidBy } = parsed.data;
    const userId = req.user!.userId;

    await assertFamilyMember(userId, familyId);

    const expense = await prisma.expense.create({
      data: {
        familyId,
        category,
        amount,
        currency: currency || 'USD',
        description: description || null,
        receiptUrl: receiptUrl || null,
        paidBy: paidBy || userId,
        createdBy: userId,
      },
    });

    res.status(201).json({ data: { expense } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/budget?familyId=xxx — List expenses for family ────────────────
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId, category } = req.query as { familyId?: string; category?: string };
    const userId = req.user!.userId;

    if (!familyId) {
      throw new BadRequestError('familyId query parameter is required');
    }

    await assertFamilyMember(userId, familyId);

    const expenses = await prisma.expense.findMany({
      where: {
        familyId,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      data: {
        expenses,
        summary: {
          total,
          count: expenses.length,
          byCategory,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/budget/:id — Get expense details ──────────────────────────────
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense not found');

    await assertFamilyMember(userId, expense.familyId);

    res.json({ data: { expense } });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/budget/:id — Update expense ─────────────────────────────────
router.patch('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense not found');

    await assertFamilyMember(userId, expense.familyId);

    const parsed = updateExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ data: { expense: updated } });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/budget/:id — Delete expense ────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundError('Expense not found');

    const user = await assertFamilyMember(userId, expense.familyId);
    if (user.role !== 'MANAGER' && expense.createdBy !== userId) {
      throw new ForbiddenError('Only the expense creator or family manager can delete');
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ data: { message: 'Expense deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
