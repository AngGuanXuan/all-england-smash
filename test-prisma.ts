import prisma from "./src/lib/prisma";
async function main() {
  try {
    await prisma.match.upsert({
      where: { id: "000000000000000000000000" },
      update: { playerScore: 10, aiScore: 5, winner: "Player", timestamp: new Date(), difficulty: "medium" },
      create: { id: "000000000000000000000000", playerScore: 10, aiScore: 5, winner: "Player", timestamp: new Date(), difficulty: "medium" }
    });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
