"use server";

import prisma from "@/lib/prisma";
import type { Match } from "@prisma/client";

export interface MatchData {
  id: string;
  playerScore: number;
  aiScore: number;
  winner: string;
  timestamp: string;
}

export async function getMatches(): Promise<MatchData[]> {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { timestamp: "desc" },
    });
    return matches.map((match: Match) => ({
      id: match.id,
      playerScore: match.playerScore,
      aiScore: match.aiScore,
      winner: match.winner,
      timestamp: match.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching matches from DB:", error);
    return [];
  }
}

export async function saveMatch(match: MatchData): Promise<boolean> {
  try {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {
        playerScore: match.playerScore,
        aiScore: match.aiScore,
        winner: match.winner,
        timestamp: new Date(match.timestamp),
      },
      create: {
        id: match.id,
        playerScore: match.playerScore,
        aiScore: match.aiScore,
        winner: match.winner,
        timestamp: new Date(match.timestamp),
      },
    });
    return true;
  } catch (error) {
    console.error("Error saving match to DB:", error);
    return false;
  }
}
