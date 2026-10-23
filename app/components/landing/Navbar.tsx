"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#how-it-works" },
    { label: "Interactive Canvas", href: "#canvas" },
    { label: "Dashboard", href: "#dashboard" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 py-3 bg-neutral-background/64 backdrop-blur-[10px] border-b border-black/12">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-heading font-semibold text-text-primary flex items-center gap-2"
        >
          <BookOpen className="size-7 text-brand-primary" aria-hidden="true" /> StudyBuddy
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-text-primary rounded-md hover:bg-black/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-flex bg-text-primary text-white hover:bg-text-primary/90 rounded-sm px-4 py-2 text-sm font-medium transition-colors"
          >
            Start Studying
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-neutral-background/95 backdrop-blur-md border-t border-black/8 px-6 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-text-primary rounded-md hover:bg-black/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full mt-2 bg-text-primary text-white hover:bg-text-primary/90 rounded-sm px-4 py-3 text-sm font-medium text-center transition-colors"
          >
            Start Studying
          </Link>
        </div>
      )}
    </header>
  );
}