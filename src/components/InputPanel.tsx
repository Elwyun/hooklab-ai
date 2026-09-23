"use client";

import { useState } from "react";
import type { FormData } from "@/types/hook";

interface InputPanelProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
}

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "urgent", label: "Urgent" },
  { value: "humorous", label: "Humorous" },
  { value: "luxury", label: "Luxury / Premium" },
  { value: "empathetic", label: "Empathetic" },
];

const platforms = [
  { id: "meta", label: "Meta Ads", icon: "📱" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "instagram", label: "Instagram Reels", icon: "📸" },
  { id: "youtube", label: "YouTube Shorts", icon: "▶️" },
];

const durations = ["15s", "30s", "60s", "+60s"];

const smartHints: Record<string, string> = {
  food: "cth: Kopi Nusantara Premium",
  fashion: "cth: Tas Kulit Handmade",
  tech: "cth: Aplikasi Belajar Online",
  health: "cth: Vitamin Imun Tubuh",
  education: "cth: Kursus Public Speaking",
  default: "cth: Produk Anda",
};

export default function InputPanel({
  formData,
  onFormChange,
  onGenerate,
  isLoading,
}: InputPanelProps) {
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
  const [customTone, setCustomTone] = useState("");
  const [industryHint, setIndustryHint] = useState("default");

  const updateField = (field: keyof FormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  const charCount = formData.productDescription.length;
  const isOverLimit = charCount > 500;

  const handleSubmit = () => {
    if (!formData.productName.trim() || !formData.productDescription.trim()) {
      return;
    }
    onGenerate(formData);
  };

  const selectedTone =
    tones.find((t) => t.value === formData.tone)?.label ||
    customTone ||
    "Professional";

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-sm">
          📝
        </span>
        <h2 className="text-sm font-semibold text-slate-900">Input Panel</h2>
      </div>

      {/* Industry hint selector */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>🏭</span> Industri
        </label>
        <select
          value={industryHint}
          onChange={(e) => setIndustryHint(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="default">General</option>
          <option value="food">Makanan & Minuman</option>
          <option value="fashion">Fashion</option>
          <option value="tech">Teknologi</option>
          <option value="health">Kesehatan</option>
          <option value="education">Pendidikan</option>
        </select>
        <p className="text-[11px] text-slate-400">
          💡 Saran akan menyesuaikan berdasarkan industri
        </p>
      </div>

      {/* Product Name */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>🏷️</span> Nama Produk
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => updateField("productName", e.target.value)}
          placeholder={smartHints[industryHint]}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <p className="text-[11px] text-slate-400">
          💡 {smartHints[industryHint]}
        </p>
      </div>

      {/* Product Description */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>📄</span> Deskripsi Produk
        </label>
        <div className="relative">
          <textarea
            value={formData.productDescription}
            onChange={(e) => updateField("productDescription", e.target.value)}
            placeholder="Jelaskan produk Anda secara detail... Apa masalah yang dipecahkan? Apa keunggulannya?"
            rows={4}
            maxLength={500}
            className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              isOverLimit
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          <div className="absolute bottom-2 right-2">
            <span
              className={`text-[11px] ${
                isOverLimit
                  ? "font-medium text-red-500"
                  : charCount > 400
                    ? "text-amber-500"
                    : "text-slate-400"
              }`}
            >
              {charCount}/500
            </span>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>🎯</span> Target Audiens
        </label>
        <input
          type="text"
          value={formData.targetAudience}
          onChange={(e) => updateField("targetAudience", e.target.value)}
          placeholder="cth: Pekerja kantoran urban usia 25-40 tahun"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Tone of Voice */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>🎙️</span> Tone of Voice
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <span>
              {formData.tone === "custom" ? `✏️ ${customTone}` : selectedTone}
            </span>
            <svg
              className={`h-4 w-4 text-slate-500 transition-transform ${
                toneDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {toneDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {tones.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => {
                    updateField("tone", tone.value);
                    setToneDropdownOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 ${
                    formData.tone === tone.value
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {tone.label}
                  {formData.tone === tone.value && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 px-3 py-2">
                <input
                  type="text"
                  value={customTone}
                  onChange={(e) => {
                    setCustomTone(e.target.value);
                    updateField("tone", "custom");
                  }}
                  placeholder="✏️ Custom tone..."
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>📱</span> Platform
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => updateField("platform", p.id)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all ${
                formData.platform === p.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{p.icon}</span>
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <span>⏱️</span> Durasi Video
        </label>
        <div className="flex gap-1.5">
          {durations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateField("duration", d)}
              className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                formData.duration === d
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          isLoading ||
          !formData.productName.trim() ||
          !formData.productDescription.trim()
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
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
            Generating...
          </>
        ) : (
          <>
            <span>🚀</span> Generate Hook
          </>
        )}
      </button>

      {/* Credits info */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <span>⚡</span>
        <span>5/10 credits today</span>
        <span className="mx-1">•</span>
        <span>Resets in 12h</span>
      </div>
    </div>
  );
}
