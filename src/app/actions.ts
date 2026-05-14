"use server";

import { revalidatePath } from "next/cache";
import type { Match } from "../generated/client";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export interface MatchData {
  id: string;
  playerScore: number;
  aiScore: number;
  winner: string;
  timestamp: string;
  difficulty: string;
}

export async function getMatches(difficulty?: string): Promise<MatchData[]> {
  try {
    const where = difficulty && difficulty !== "all" ? { difficulty } : {};
    const matches = await prisma.match.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });
    return matches.map((match: Match) => ({
      id: match.id,
      playerScore: Number(match.playerScore),
      aiScore: Number(match.aiScore),
      winner: match.winner,
      timestamp: match.timestamp.toISOString(),
      difficulty: match.difficulty ?? "medium",
    }));
  } catch (error) {
    console.error("Error fetching matches from DB:", error);
    return [];
  }
}

export async function saveMatch(match: MatchData): Promise<{ success: boolean; message: string }> {
  console.log(">>> [SERVER] saveMatch called with:", JSON.stringify(match));

  try {
    // Basic validation
    if (!match.id || match.id === "unknown") {
      console.error(">>> [SERVER] Invalid ID:", match.id);
      return { success: false, message: "Invalid match ID" };
    }

    console.log(">>> [SERVER] Attempting upsert for ID:", match.id, "Difficulty:", match.difficulty);

    await prisma.match.upsert({
      where: { id: match.id },
      update: {
        playerScore: BigInt(match.playerScore),
        aiScore: BigInt(match.aiScore),
        winner: match.winner,
        timestamp: new Date(match.timestamp),
        difficulty: match.difficulty,
      },
      create: {
        id: match.id,
        playerScore: BigInt(match.playerScore),
        aiScore: BigInt(match.aiScore),
        winner: match.winner,
        timestamp: new Date(match.timestamp),
        difficulty: match.difficulty,
      },
    });

    console.log(">>> [SERVER] Upsert successful");
    revalidatePath("/", "layout");
    revalidatePath("/game");
    return { success: true, message: "Saved successfully" };
  } catch (error) {
    console.error(">>> [SERVER] Upsert error:", error);
    let errorMsg = "Database error";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    return { success: false, message: errorMsg };
  }
}

export async function testInsertion() {
  const id = randomBytes(12).toString("hex");
  try {
    await prisma.match.create({
      data: {
        id: id,
        playerScore: BigInt(21),
        aiScore: BigInt(0),
        winner: "Player",
        timestamp: new Date(),
        difficulty: "medium",
      },
    });
    revalidatePath("/game");
    return { success: true, message: `Inserted dummy match ${id}` };
  } catch (error) {
    console.error("Test insertion failed:", error);
    return { success: false, message: error instanceof Error ? error.message : String(error) };
  }
}
