import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  hideText?: boolean;
}

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  // Since the new emblem logo contains the full text, we hide the redundant text
  // and make the logo larger so it's clearly legible.
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 group transition-transform hover:scale-[1.02] active:scale-95 ${className}`}
    >
      <div className="flex items-center relative transition-all duration-300">
        <Image
          src="/logo-white.png"
          alt="All England Smash Logo"
          width={859}
          height={859}
          className="w-[160px] object-contain relative z-10"
          draggable={false}
        />
      </div>
    </Link>
  );
}
