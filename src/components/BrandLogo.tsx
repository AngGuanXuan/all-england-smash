import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  hideText?: boolean;
}

export default function BrandLogo({
  className = "",
  hideText = false,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 group transition-transform hover:scale-[1.02] active:scale-95 ${className}`}
    >
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm p-1 shadow-[0_0_15px_rgba(52,211,153,0.2)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] transition-all duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Image
          src="/logo.png"
          alt="AES Logo"
          width={48}
          height={48}
          className="w-full h-full object-contain relative z-10"
        />
      </div>
      {!hideText && (
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
          AES
          <span className="text-slate-500 font-medium group-hover:text-pink-400 transition-colors hidden sm:inline">
            mash
          </span>
        </span>
      )}
    </Link>
  );
}
