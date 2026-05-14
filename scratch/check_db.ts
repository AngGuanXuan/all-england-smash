
import prisma from "../src/lib/prisma";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Using DATABASE_URL:", process.env.DATABASE_URL);
  const id = "111122223333444455556666";
  try {
    const result = await prisma.match.upsert({
      where: { id: id },
      update: {
        playerScore: BigInt(21),
        aiScore: BigInt(19),
        winner: "Player",
        timestamp: new Date(),
        difficulty: "hard",
      },
      create: {
        id: id,
        playerScore: BigInt(21),
        aiScore: BigInt(19),
        winner: "Player",
        timestamp: new Date(),
        difficulty: "hard",
      },
    });
    console.log("Upserted match:", result);
    
    const count = await prisma.match.count();
    console.log("Total matches now:", count);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
