import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] font-sans selection:bg-emerald-500/30">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-lighten" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Navigation (minimal) */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto left-0 right-0">
        <BrandLogo />
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          {/* <Link
            href="/game"
            className="hover:text-emerald-400 text-slate-300 transition-colors cursor-pointer"
          >
            Game
          </Link> */}
          <Link
            href="/leaderboard"
            className="hover:text-pink-400 text-slate-300 transition-colors cursor-pointer"
          >
            Leaderboard
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-32 sm:pt-40">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">
            Beta Available Now
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 max-w-4xl mb-6 leading-[1.1]">
          Experience The Ultimate <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            Badminton
          </span>{" "}
          Showdown.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
          Step onto the court and face off against an elite AI. Fast-paced
          rallies, epic smashes, and fluid 2D physics. Are you ready to claim
          the trophy?
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/game"
            className="group relative px-8 py-4 rounded-full bg-emerald-500 text-white font-bold text-lg overflow-hidden transition-transform hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              Play Now
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </Link>
          {/* <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            View Source
          </a> */}
        </div>

        {/* Features & Hero Image Container */}
        <div className="mt-16 sm:mt-24 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Game Features Description */}
          <div className="flex flex-col gap-6 text-left order-2 lg:order-1">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-1">
              <div className="w-10 h-10 mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                Authentic Physics
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Experience a custom aerodynamics engine that perfectly simulates
                shuttlecock drags, gravity arcs, and net collisions for an
                authentic badminton feel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-1">
              <div className="w-10 h-10 mb-4 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-pink-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">
                Elite AI Opponent
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Face off against an adaptive AI that tracks the shuttle,
                positions itself strategically, and unleashes powerful smashes
                to keep you on your toes.
              </p>
            </div>
          </div>

          {/* Right Side: Hero Image */}
          <div className="relative w-full order-1 lg:order-2 group">
            <div className="relative rounded-2xl md:rounded-[2.4rem] overflow-hidden border border-white/10 shadow-[8px_8px_20px_rgba(52,211,153,0.2)] transition-all duration-700 ease-in-out group-hover:-translate-y-4 group-hover:shadow-[12px_12px_25px_rgba(52,211,153,0.8)]">
              <Image
                src="/hero.png"
                alt="High-end glowing shuttlecock"
                width={1200}
                height={800}
                priority
                draggable={false}
                className="w-full object-cover scale-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-12 text-center text-slate-500 text-sm">
        <p>© 2026 All England Smash. Built with Next.js and React.</p>
      </footer>
    </div>
  );
}
