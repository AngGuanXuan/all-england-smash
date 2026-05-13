import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import InteractiveScorecard from "@/components/InteractiveScorecard";
import { getMatches } from "../actions";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export default async function LobbyPage() {
  const matches = await getMatches();
  const nextMatchId = randomBytes(12).toString("hex");

  // Compute scorecard stats
  const totalGames = matches.length;
  const playerWins = matches.filter((m) => m.winner === "Player").length;
  const aiWins = matches.filter((m) => m.winner === "AI").length;
  const winRate =
    totalGames > 0 ? Math.round((playerWins / totalGames) * 100) : 0;

  // Longest winning streak
  let longestStreak = 0;
  let currentStreak = 0;
  for (const m of [...matches].reverse()) {
    if (m.winner === "Player") {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Best score in a single game
  const bestScore =
    totalGames > 0 ? Math.max(...matches.map((m) => m.playerScore)) : 0;

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
          </div>

          {/* ── Right: Global Scorecard (Interactive Client Component) ── */}
          <InteractiveScorecard
            totalGames={totalGames}
            playerWins={playerWins}
            aiWins={aiWins}
            winRate={winRate}
            bestScore={bestScore}
            longestStreak={longestStreak}
          />
        </div>

        {/* ── Bottom: Recent Matches ── */}
        {matches.length > 0 && (
          <div className="w-full flex flex-col items-center lg:items-start">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500/50 rounded-full" />
              Recent Match History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {matches.slice(0, 5).map((match, idx) => (
                <div
                  key={match.id || idx}
                  className="flex flex-col p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                        match.winner === "Player"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                      }`}
                    >
                      {match.winner === "Player" ? "Victory" : "Defeat"}
                    </span>
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
          </div>
        )}
      </div>
    </div>
  );
}
