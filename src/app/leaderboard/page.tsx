import BrandLogo from "@/components/BrandLogo";
import { getMatches } from "../actions";

export default async function LeaderboardPage() {
  const matches = await getMatches();
  
  const totalMatches = matches.length;
  const playerWins = matches.filter(m => m.winner === "Player").length;
  const aiWins = totalMatches - playerWins;
  const winRate = totalMatches > 0 ? Math.round((playerWins / totalMatches) * 100) : 0;

  // Most severe beatdowns
  const highestDifferential = [...matches].sort((a, b) => {
    const aDiff = Math.abs(a.playerScore - a.aiScore);
    const bDiff = Math.abs(b.playerScore - b.aiScore);
    return bDiff - aDiff;
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 flex flex-col items-center">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mt-12 flex flex-col gap-10">
        <div className="flex flex-col items-center">
          <BrandLogo className="mb-8" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-400 mb-4">
            Global Scorecard
          </h1>
          <p className="text-slate-400 text-lg">
            Humanity vs Artificial Intelligence
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-2">Humanity Wins</span>
            <span className="text-4xl font-black text-emerald-400">{playerWins}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-2">Total Matches</span>
            <span className="text-4xl font-black text-white">{totalMatches}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
            <span className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-2">AI Overlord Wins</span>
            <span className="text-4xl font-black text-pink-400">{aiWins}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 box-border w-full rounded-full h-4 overflow-hidden flex relative">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${winRate}%` }} />
          <div className="bg-pink-500 h-full transition-all duration-1000" style={{ width: `${100 - winRate}%` }} />
        </div>
        <p className="text-center text-sm text-slate-500 mt-[-1rem]">Global Win Rate: {winRate}%</p>

        {/* Most Decisive Victories */}
        {highestDifferential.length > 0 && (
          <div className="mt-8 bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                ⭐
              </span>
              Decisive Victories
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {highestDifferential.map(match => (
                <div key={match.id} className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-500">#{match.id}</span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      Math.abs(match.playerScore - match.aiScore) <= 2 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' 
                        : (match.winner === 'Player' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-pink-500/20 text-pink-300')
                    }`}>
                      {Math.abs(match.playerScore - match.aiScore) <= 2 ? 'Close Game' : `${match.winner} Dominance`}
                    </span>
                  </div>
                  <div className="text-xl font-black tracking-widest">
                    <span className="text-emerald-400">{match.playerScore}</span>
                    <span className="text-slate-600 mx-2">-</span>
                    <span className="text-pink-400">{match.aiScore}</span>
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
