"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-base font-bold text-white">
            🪝
          </span>
          <span className="text-lg font-bold text-slate-900">
            Hook<span className="text-blue-600">Lab</span> AI
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Projects
          </Link>
          <a
            href="#"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Pricing
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Credits Badge */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-6 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              <span>⚡</span>
              <span>5/10 credits</span>
            </div>
          </div>

          {/* Auth Modal (Login/User Menu) */}
          <AuthModal />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/projects"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Projects
            </Link>
            <a
              href="#"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Pricing
            </a>
            <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
              <div className="flex h-6 items-center gap-1 rounded-full bg-amber-50 px-2.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                <span>⚡</span>
                <span>5/10 credits</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
