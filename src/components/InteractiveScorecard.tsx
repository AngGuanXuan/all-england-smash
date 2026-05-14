"use client";

import React, { useState, useRef } from "react";

interface InteractiveScorecardProps {
  totalGames: number;
  playerWins: number;
  aiWins: number;
  winRate: number;
  humanBiggestWin: number | string;
  aiBiggestWin: number | string;
}

export default function InteractiveScorecard({
  totalGames,
  playerWins,
  aiWins,
  winRate,
  humanBiggestWin,
  aiBiggestWin,
}: InteractiveScorecardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className="flex-1 w-full max-w-2xl lg:max-w-none [perspective:1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="glass-light rounded-3xl p-8 shadow-[20px_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/10 transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <h2 className="text-xl font-bold text-slate-300 mb-8 flex items-center gap-3 tracking-wider uppercase [transform:translateZ(30px)]">
          <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
          Global Scorecard
        </h2>

        {totalGames === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-2xl [transform:translateZ(20px)]">
            <p className="text-4xl mb-3">🏸</p>
            <p className="text-slate-500 font-medium">No matches yet.</p>
            <p className="text-slate-600 text-sm mt-1">
              Play your first game to see your stats.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 [transform-style:preserve-3d]">
            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-4 [transform-style:preserve-3d]">
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-white/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[-8px_8px_0px_rgba(39,39,42,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase">
                  Total Games
                </span>
                <span className="text-4xl font-black text-white">
                  {totalGames}
                </span>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-emerald-500/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[8px_8px_0px_rgba(6,78,59,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase text-emerald-400">
                  Win Rate
                </span>
                <span className="text-4xl font-black text-emerald-400">
                  {winRate}%
                </span>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-emerald-500/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[-8px_8px_0px_rgba(6,78,59,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase text-emerald-400">
                  Your Wins
                </span>
                <span className="text-4xl font-black text-emerald-400">
                  {playerWins}
                </span>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-pink-500/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[8px_8px_0px_rgba(131,24,67,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase text-pink-400">
                  AI Wins
                </span>
                <span className="text-4xl font-black text-pink-400">
                  {aiWins}
                </span>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-teal-500/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[-8px_8px_0px_rgba(19,78,74,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase text-teal-300">
                  Human Biggest Win
                </span>
                <span className="text-3xl font-black text-teal-300">
                  {humanBiggestWin}
                </span>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-none p-5 flex flex-col gap-1 [transform:translateZ(40px)] shadow-lg transition-all hover:bg-amber-500/10 hover:[transform:translateZ(60px)_scale(1.05)] hover:shadow-[8px_8px_0px_rgba(120,53,15,1)]">
                <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase text-amber-400">
                  AI Biggest Win
                </span>
                <span className="text-3xl font-black text-amber-400">
                  {aiBiggestWin}
                </span>
              </div>
            </div>

            {/* Win rate bar */}
            <div className="flex flex-col gap-3 [transform:translateZ(50px)]">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span className="text-emerald-400 font-semibold">
                  You — {playerWins}W
                </span>
                <span className="text-pink-400 font-semibold">
                  AI — {aiWins}W
                </span>
              </div>
              <div className="w-full rounded-full h-4 overflow-hidden flex bg-slate-800/60 border border-white/5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 rounded-l-full"
                  style={{ width: `${winRate}%` }}
                />
                <div
                  className="bg-gradient-to-r from-pink-600 to-rose-500 h-full transition-all duration-1000 rounded-r-full"
                  style={{ width: `${100 - winRate}%` }}
                />
              </div>
              <p className="text-center text-xs text-slate-600">
                {winRate}% overall win rate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
