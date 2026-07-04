import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action as 'approve' | 'reject';

    const submission = await prisma.gameSubmission.findUnique({
      where: { id: params.id },
      include: { mission: true },
    });
    if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.gameSubmission.update({
      where: { id: params.id },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        pointsAwarded: action === 'approve' ? submission.mission.rewardPoints : null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
