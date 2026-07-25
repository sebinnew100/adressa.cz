import { prisma } from '@/lib/db';
import { PAYOUT_POINTS_THRESHOLD } from '@/lib/gamePayoutConstants';

export { PAYOUT_POINTS_THRESHOLD, PAYOUT_AMOUNT_CZK } from '@/lib/gamePayoutConstants';

export async function getPlayerBalance(playerId: string) {
  const [submissions, payoutRequests] = await Promise.all([
    prisma.gameSubmission.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, missionId: true, status: true, pointsAwarded: true, createdAt: true },
    }),
    prisma.payoutRequest.findMany({
      where: { playerId, status: { in: ['pending', 'paid'] } },
      select: { pointsSpent: true, status: true },
    }),
  ]);

  const totalPoints = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.pointsAwarded ?? 0), 0);

  const spentPoints = payoutRequests.reduce((sum, p) => sum + p.pointsSpent, 0);
  const availablePoints = totalPoints - spentPoints;
  const pendingPayout = payoutRequests.some(p => p.status === 'pending');

  return { totalPoints, availablePoints, pendingPayout, submissions };
}
