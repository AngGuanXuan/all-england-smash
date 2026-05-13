"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

export default function PageLoader({ isDone }: { isDone?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        // If external control is active, cap progress at 90% until isDone is true
        if (isDone === false && prev >= 90) {
          return 90;
        }

        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }

        // Slower progress as it nears the end to avoid jumping
        const increment = prev > 80 ? Math.random() * 2 : Math.random() * 15;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isDone]);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            <BrandLogo className="w-24 h-24 mb-12" />

            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                Loading Arena
              </span>
              <span className="text-sm font-mono text-emerald-400 font-black">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>

          {/* Bottom attribution or decorative text */}
          <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.5em] text-white/10 font-bold">
            All England Smash 2026
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
