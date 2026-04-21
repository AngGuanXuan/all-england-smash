import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'matches.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const matchData of data) {
    const { id, playerScore, aiScore, winner, timestamp } = matchData;
    await prisma.match.upsert({
      where: { id: id },
      update: {
        playerScore,
        aiScore,
        winner,
        timestamp: new Date(timestamp),
      },
      create: {
        id,
        playerScore,
        aiScore,
        winner,
        timestamp: new Date(timestamp),
      },
    });
    console.log(`Upserted match ${id}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
