"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          poster="/hero.png"
        >
          <source
            src="https://videos.pexels.com/video-files/3191572/3191572-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Animated accent lines */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          className="absolute top-1/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"
        />
        <motion.div
          initial={{ x: "200%" }}
          animate={{ x: "-100%" }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut", delay: 2 }}
          className="absolute top-3/4 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-40"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass inline-flex items-center gap-3 rounded-full px-5 py-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-medium tracking-wide text-white/90 uppercase">
              Live Matches Available
            </span>
          </div>
        </motion.div>

        {/* Main Headline with staggered animation */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-white leading-[0.9] mb-4"
          >
            <span className="block">FEEL THE</span>
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] mb-6"
          >
            <span className="bg-gradient-to-r from-accent via-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              GAME
            </span>
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-2xl text-lg sm:text-xl text-white/70 font-medium leading-relaxed mb-10"
        >
          Experience the intensity of live sports. Every rally, every smash, every moment of glory. 
          Step onto the virtual court and dominate.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/game"
            className="group relative overflow-hidden rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 animate-pulse-glow"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Live
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <Link
            href="/leaderboard"
            className="glass-light group rounded-full px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              Join Now
              <svg
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="absolute bottom-12 left-0 right-0 px-6"
        >
          <div className="glass mx-auto max-w-4xl rounded-2xl px-8 py-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">50K+</div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1">Active Players</div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-2xl sm:text-3xl font-black text-accent">LIVE</div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1">Matches Now</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">24/7</div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider mt-1">Tournament Access</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
