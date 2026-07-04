import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  if (providers.length === 0) {
    console.log('No active providers found to attach missions to.');
    return;
  }

  console.log(`Creating missions for ${providers.length} providers...`);

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const isGrandChallenge = i === 0; // first one is the flagship grand challenge

    await prisma.gameMission.create({
      data: {
        providerId: provider.id,
        rewardPoints: isGrandChallenge ? 500 : 20 + Math.floor(Math.random() * 80),
        isGrandChallenge,
        expiresAt: isGrandChallenge ? hoursFromNow(0.33) : hoursFromNow(2 + Math.random() * 22),
        active: true,
      },
    });
    console.log(`  ✓ Mission for ${provider.fullName}${isGrandChallenge ? ' (GRAND CHALLENGE)' : ''}`);
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
