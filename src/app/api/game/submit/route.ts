import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const playerId = (session?.user as { id?: string } | undefined)?.id;
    if (!playerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const missionId = (formData.get('missionId') as string | null)?.trim() ?? '';
    const photoFile = formData.get('photo') as File | null;
    const nickname = (formData.get('nickname') as string | null)?.trim().slice(0, 20) || null;

    if (!missionId || !photoFile || photoFile.size === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mission = await prisma.gameMission.findUnique({ where: { id: missionId } });
    if (!mission || !mission.active || mission.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Mission not available' }, { status: 400 });
    }

    if (nickname) {
      await prisma.player.update({ where: { id: playerId }, data: { nickname } });
    }

    const ext = photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `game-submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(filename, photoFile, { access: 'public' });

    const submission = await prisma.gameSubmission.create({
      data: { playerId, missionId, photoPath: blob.url, status: 'pending' },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
