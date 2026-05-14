import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import InteractiveScorecard from "@/components/InteractiveScorecard";
import { getMatches } from "../actions";
import { randomBytes } from "crypto";
import TestInsertButton from "@/components/TestInsertButton";
import DifficultyFilter from "@/components/DifficultyFilter";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function LobbyPage(props: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const searchParams = await props.searchParams;
  const difficulty = searchParams.difficulty || "all";
  const matches = await getMatches(difficulty);
  const nextMatchId = randomBytes(12).toString("hex");

  // Compute scorecard stats
  const totalGames = matches.length;
  const playerWins = matches.filter((m) => m.winner === "Player").length;
  const aiWins = matches.filter((m) => m.winner === "AI").length;
  const winRate =
    totalGames > 0 ? Math.round((playerWins / totalGames) * 100) : 0;

  // Human biggest win (largest margin)
  let humanBiggestWinMatch = null;
  let maxHumanMargin = -1;

  // AI biggest win (largest margin)
  let aiBiggestWinMatch = null;
  let maxAiMargin = -1;

  for (const m of matches) {
    if (m.winner === "Player") {
      const margin = m.playerScore - m.aiScore;
      if (margin > maxHumanMargin) {
        maxHumanMargin = margin;
        humanBiggestWinMatch = m;
      }
    } else if (m.winner === "AI") {
      const margin = m.aiScore - m.playerScore;
      if (margin > maxAiMargin) {
        maxAiMargin = margin;
        aiBiggestWinMatch = m;
      }
    }
  }

  const humanBiggestWin = humanBiggestWinMatch
    ? `${humanBiggestWinMatch.playerScore} - ${humanBiggestWinMatch.aiScore}`
    : "-";

  const aiBiggestWin = aiBiggestWinMatch
    ? `${aiBiggestWinMatch.playerScore} - ${aiBiggestWinMatch.aiScore}`
    : "-";

  // Last match
  const lastMatch = matches[0] ?? null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-8 flex items-center justify-center select-none font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mt-16 lg:mt-0 flex flex-col gap-20">
        {/* Top: Two-Column Header & Scorecard */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* ── Left: Lobby Header & CTA ── */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <BrandLogo hideText className="mb-8" />
            <h1 className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-6">
              Game Lobby
            </h1>
            <p className="text-slate-400 text-lg lg:text-xl max-w-md mb-12">
              Challenge the AI and prove your mastery on the court. Every smash
              counts.
            </p>

            <Link
              href={`/match/${nextMatchId}`}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start New Match
            </Link>

            {/* <TestInsertButton /> */}
          </div>

          {/* ── Right: Global Scorecard (Interactive Client Component) ── */}
          <InteractiveScorecard
            totalGames={totalGames}
            playerWins={playerWins}
            aiWins={aiWins}
            winRate={winRate}
            humanBiggestWin={humanBiggestWin}
            aiBiggestWin={aiBiggestWin}
          />
        </div>

        {/* ── Bottom: Recent Matches ── */}
        <div className="w-full flex flex-col items-center lg:items-start">
          <div className="w-full flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500/50 rounded-full" />
              Recent Match History
            </h3>
            <Suspense>
              <DifficultyFilter />
            </Suspense>
          </div>

          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {matches.slice(0, 5).map((match, idx) => (
                <div
                  key={match.id || idx}
                  className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter w-fit ${
                          match.winner === "Player"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        }`}
                      >
                        {match.winner === "Player" ? "Victory" : "Defeat"}
                      </span>
                      <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5 ml-1">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                        {match.difficulty?.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(match.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white leading-none">
                        {match.playerScore}
                      </span>
                      <span className="text-[9px] uppercase text-slate-500 mt-1">
                        You
                      </span>
                    </div>
                    <span className="text-slate-700 font-bold">:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-400 leading-none">
                        {match.aiScore}
                      </span>
                      <span className="text-[9px] uppercase text-slate-500 mt-1">
                        AI
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-12 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500">
              <span className="text-3xl mb-2">🏸</span>
              <p className="font-medium">
                No matches found for this difficulty.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
