"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const DIFFICULTIES = [
  { key: "all", label: "All Matches" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
  { key: "super_hard", label: "Super Hard" },
];

export default function DifficultyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDiff = searchParams.get("difficulty") || "all";
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") {
      params.delete("difficulty");
    } else {
      params.set("difficulty", key);
    }
    router.push(`/game?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const selectedLabel = DIFFICULTIES.find(d => d.key === currentDiff)?.label || "All Matches";

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-x-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-all active:scale-95"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
        >
          {selectedLabel}
          <svg className={`-mr-1 h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden backdrop-blur-xl"
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.key}
                  onClick={() => handleSelect(diff.key)}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentDiff === diff.key 
                    ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                    : "text-slate-300 hover:bg-white/5"
                  }`}
                  role="menuitem"
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
