"use server";

import fs from "fs/promises";
import path from "path";

export interface MatchData {
  id: string;
  playerScore: number;
  aiScore: number;
  winner: string;
  timestamp: string;
}

const dataDir = path.join(process.cwd(), "data");
const matchesFile = path.join(dataDir, "matches.json");

export async function getMatches(): Promise<MatchData[]> {
  try {
    const fileContent = await fs.readFile(matchesFile, "utf-8");
    return JSON.parse(fileContent);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "ENOENT") {
      return [];
    }
    console.error("Error reading matches:", error);
    return [];
  }
}

export async function saveMatch(match: MatchData): Promise<boolean> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if match already exists (prevent duplicate saves on re-renders)
    const matches = await getMatches();
    if (matches.some((m) => m.id === match.id)) {
      return true; // Already saved
    }

    matches.unshift(match);
    await fs.writeFile(matchesFile, JSON.stringify(matches, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving match:", error);
    return false;
  }
}
