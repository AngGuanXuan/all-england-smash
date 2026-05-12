"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass py-4" : "py-6"
          }`}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <BrandLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/game"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/game"
              className="glass-light rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl pt-24 px-6">
              <div className="flex flex-col gap-6">
                <Link
                  href="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold text-white hover:text-accent transition-colors"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/game"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-lg font-bold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
