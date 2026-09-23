"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import OutputGallery from "@/components/OutputGallery";
import type { FormData, HookData } from "@/types/hook";


// Real AI generation via API route
const generateHooks = async (data: FormData): Promise<HookData[]> => {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Generation failed");
  }
  const json = await res.json();
  return json.hooks;
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    productDescription: "",
    targetAudience: "",
    tone: "professional",
    platform: "meta",
    duration: "15s",
  });

  const [hooks, setHooks] = useState<HookData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to results on mobile when generation completes
  useEffect(() => {
    if (!isLoading && hasGenerated && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [isLoading, hasGenerated]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 2500);
    }
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };

  const handleFormChange = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const handleGenerate = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setHooks([]);

    try {
      const results = await generateHooks(data);
      setHooks(results);
      setHasGenerated(true);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCopyAll = useCallback(() => {
    const allText = hooks
      .map((h) => `[${h.category}] ${h.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(allText);
    showToast("✅ Semua hook berhasil disalin!");
  }, [hooks]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-bounce-once rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto mt-14 flex w-full max-w-[1440px] flex-1 flex-col">
        {/* Desktop: 3-Column Layout */}
        <div className="hidden flex-1 md:flex">
          {/* Left Panel - Input (30%) */}
          <div className="w-[30%] min-w-[280px] max-w-[380px] border-r border-slate-200 bg-white">
            <InputPanel
              formData={formData}
              onFormChange={handleFormChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          {/* Middle Panel - Preview (25%) */}
          <div className="w-[25%] min-w-[220px] max-w-[320px] border-r border-slate-200 bg-white">
            <PreviewPanel formData={formData} isLoading={isLoading} />
          </div>

          {/* Right Panel - Output Gallery (45%) */}
          <div className="flex-1 bg-slate-50">
            <OutputGallery hooks={hooks} isLoading={isLoading} />
          </div>
        </div>

        {/* Mobile: Vertical Linear Flow */}
        <div className="flex flex-1 flex-col md:hidden">
          {/* Phase 1: Input */}
          <div className="border-b border-slate-200 bg-white" id="mobile-input">
            <InputPanel
              formData={formData}
              onFormChange={handleFormChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          {isLoading && (
            <div className="bg-slate-50">
              <OutputGallery hooks={[]} isLoading={true} />
            </div>
          )}

          {/* Phase 2: Results */}
          {!isLoading && hasGenerated && (
            <div ref={resultsRef}>
              {/* Success banner */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-center text-sm font-medium text-white">
                🎉 {hooks.length} hook berhasil dibuat!
              </div>
              <div className="bg-slate-50" id="mobile-results">
                <OutputGallery hooks={hooks} isLoading={false} />
              </div>

              {/* Floating Copy All Button (FAB) */}
              <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95"
                >
                  <span>📋</span> Copy All
                </button>
              </div>
            </div>
          )}

          {/* Empty state on mobile */}
          {!isLoading && !hasGenerated && (
            <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
              <div className="text-center">
                <span className="mb-3 block text-4xl">👆</span>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">
                  Mulai Generate Hook
                </h3>
                <p className="text-xs text-slate-500">
                  Isi form di atas untuk memulai
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        <p>
          Hook<span className="font-semibold text-blue-600">Lab</span> AI —
          Built with ❤️ for marketers
        </p>
      </footer>
    </div>
  );
}
