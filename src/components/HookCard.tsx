"use client";

import { useState } from "react";

interface HookCardProps {
  id: string;
  category: string;
  categoryIcon: string;
  text: string;
  charLength: number;
  readability: "Easy" | "Medium" | "Hard";
  isFavorite?: boolean;
}

const categoryColors: Record<string, string> = {
  Emotional: "bg-rose-50 text-rose-700 border-rose-200",
  Curiosity: "bg-violet-50 text-violet-700 border-violet-200",
  Statistical: "bg-amber-50 text-amber-700 border-amber-200",
  "Problem-Solution": "bg-teal-50 text-teal-700 border-teal-200",
  AIDA: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PAS: "bg-orange-50 text-orange-700 border-orange-200",
  "Before-After": "bg-cyan-50 text-cyan-700 border-cyan-200",
  FAB: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const categoryGradients: Record<string, string> = {
  Emotional: "from-rose-500 to-pink-600",
  Curiosity: "from-violet-500 to-purple-600",
  Statistical: "from-amber-500 to-yellow-600",
  "Problem-Solution": "from-teal-500 to-emerald-600",
  AIDA: "from-indigo-500 to-blue-600",
  PAS: "from-orange-500 to-red-600",
  "Before-After": "from-cyan-500 to-blue-600",
  FAB: "from-emerald-500 to-teal-600",
};

const readabilityColors: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

export default function HookCard({

  category,
  categoryIcon,
  text,
  charLength,
  readability,
  isFavorite: initialFavorite = false,
}: HookCardProps) {
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(initialFavorite);
  const [isRemixing, setIsRemixing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    setIsFav(!isFav);
  };

  const handleRemix = () => {
    setIsRemixing(true);
    setTimeout(() => setIsRemixing(false), 1500);
  };

  const timeEstimate = Math.max(1, Math.round((charLength / 45) * 10) / 10);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
    >
      {/* Top gradient accent */}
      <div className={`h-1 w-full bg-gradient-to-r ${categoryGradients[category]}`} />

      <div className="p-3 sm:p-4">
        {/* Category Badge + Actions */}
        <div className="mb-2.5 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              categoryColors[category] ?? "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {categoryIcon} {category}
          </span>

          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy hook text"}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
              title="Copy"
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <span>✅</span> Tersalin!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>📋</span> Copy
                </span>
              )}
            </button>

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={isFav ? "Unsave hook" : "Save hook"}
              className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                isFav
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title={isFav ? "Unsave" : "Save"}
            >
              {isFav ? "⭐" : "☆"}
            </button>

            {/* Remix Button */}
            <button
              type="button"
              onClick={handleRemix}
              disabled={isRemixing}
              aria-label={isRemixing ? "Remixing hook" : "Remix hook"}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              title="Remix"
            >
              {isRemixing ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3 w-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>🔄</span> Remix
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Hook Text */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed text-slate-800">&ldquo;{text}&rdquo;</p>
        </div>

        {/* Performance Badges */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            📏 {charLength} chars
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
              readabilityColors[readability] || "bg-slate-100 text-slate-600"
            }`}
          >
            🎯 {readability}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            ⏱️ {timeEstimate}s
            <span
              className={
                timeEstimate <= 3
                  ? "text-emerald-600"
                  : "text-amber-600"
              }
            >
              {timeEstimate <= 3 ? " ✓" : " ⚠️"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
