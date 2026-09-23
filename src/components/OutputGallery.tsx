"use client";

import HookCard from "./HookCard";
import type { HookData } from "@/types/hook";

interface OutputGalleryProps {
  hooks: HookData[];
  isLoading: boolean;
}

export default function OutputGallery({ hooks, isLoading }: OutputGalleryProps) {
  // Empty state
  if (!isLoading && hooks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-900">
          Belum ada hook
        </h3>
        <p className="mb-4 max-w-xs text-xs leading-relaxed text-slate-500">
          Isi form di panel kiri lalu klik <strong>Generate</strong> untuk
          mulai membuat hook yang memikat!
        </p>
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 ring-1 ring-blue-200">
          💡 Coba masukkan nama produk dan target audiens Anda
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-sm">
            🎯
          </span>
          <h2 className="text-sm font-semibold text-slate-900">
            Generated Hooks
          </h2>
        </div>
        {!isLoading && hooks.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            {hooks.length} hasil
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {/* Skeleton Loader */}
            <div className="animate-pulse">
              <div className="mb-3 h-1 w-full rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200" />
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-7 w-16 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                  </div>
                </div>
                <div className="mb-3 space-y-2">
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-4/6 rounded bg-slate-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                </div>
              </div>
            </div>

            <div className="animate-pulse" style={{ animationDelay: "0.1s" }}>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-5 w-28 rounded-full bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-7 w-16 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                  </div>
                </div>
                <div className="mb-3 space-y-2">
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                </div>
              </div>
            </div>

            <div className="animate-pulse" style={{ animationDelay: "0.2s" }}>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="h-5 w-20 rounded-full bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-7 w-16 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                    <div className="h-7 w-7 rounded-lg bg-slate-200" />
                  </div>
                </div>
                <div className="mb-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
              </div>
              <span className="text-xs font-medium text-blue-700">60%</span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {hooks.map((hook) => (
                <HookCard key={hook.id} {...hook} />
              ))}
            </div>

            {/* Export All */}
            {hooks.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs font-medium text-slate-600">
                  📥 Export All:
                </span>
                <button
                  onClick={() => {
                    const rows = hooks.map(h => [h.category, h.text, h.charLength, h.readability]);
                    const csv = "Category,Text,Length,Readability\n" + rows.map(r => r.join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "hooks.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-400"
                >
                  📄 CSV
                </button>
                <button
                  onClick={() => {
                    // Simple TSV for Excel compatibility
                    const rows = hooks.map(h => [h.category, h.text, h.charLength, h.readability]);
                    const tsv = "Category\tText\tLength\tReadability\n" + rows.map(r => r.join("\t")).join("\n");
                    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "hooks.tsv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-400"
                >
                  📊 TSV
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
