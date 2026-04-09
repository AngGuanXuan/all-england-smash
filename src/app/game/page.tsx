import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getMatches } from "../actions";
import { randomUUID } from "crypto";

export default async function LobbyPage() {
  const matches = await getMatches();
  const nextMatchId = randomUUID().slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-8 flex flex-col items-center select-none font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl mt-16 flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col items-center">
          <BrandLogo className="mb-8" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-sm mb-4">
            Game Lobby
          </h1>
          <p className="text-slate-400 text-lg">
            Create a new match or review your previous epic battles.
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex justify-center">
          <Link
            href={`/match/${nextMatchId}`}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Start New Match
          </Link>
        </div>

        {/* Match History Board */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </span>
            Match History
          </h2>

          {matches.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
              <p className="text-slate-500">
                No matches played yet. Step onto the court first!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm tracking-wide">
                    <th className="pb-4 font-medium pl-4">Match ID</th>
                    <th className="pb-4 font-medium">Winner</th>
                    <th className="pb-4 font-medium text-center">
                      Score (You - AI)
                    </th>
                    <th className="pb-4 font-medium text-right pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {matches.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 pl-4 text-slate-300 pointer-events-none group-hover:text-white transition-colors">
                        #{match.id}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            match.winner === "Player"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                              : "bg-pink-500/20 text-pink-300 border border-pink-500/20"
                          }`}
                        >
                          {match.winner === "Player" ? "🏆 Player" : "🤖 AI"}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="font-bold text-emerald-400">
                          {match.playerScore}
                        </span>
                        <span className="text-slate-600 mx-2">—</span>
                        <span className="font-bold text-pink-400">
                          {match.aiScore}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4 text-slate-500">
                        {new Date(match.timestamp).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
