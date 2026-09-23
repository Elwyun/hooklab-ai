"use client";

interface PreviewPanelProps {
  formData: {
    productName: string;
    productDescription: string;
    targetAudience: string;
    tone: string;
    platform: string;
    duration: string;
  };
  isLoading: boolean;
}

const formatTemplates = [
  { id: "aida", label: "AIDA", desc: "Attention → Interest → Desire → Action" },
  { id: "pas", label: "PAS", desc: "Problem → Agitate → Solution" },
  { id: "bab", label: "BAB", desc: "Before → After → Bridge" },
  { id: "fab", label: "FAB", desc: "Features → Advantages → Benefits" },
];

const platformNames: Record<string, string> = {
  meta: "Meta Ads",
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};

export default function PreviewPanel({ formData, isLoading }: PreviewPanelProps) {
  const hasInput = formData.productName || formData.productDescription;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 text-sm">
          ⚙️
        </span>
        <h2 className="text-sm font-semibold text-slate-900">
          Generation Settings
        </h2>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          🔍 Live Preview
        </h3>

        {hasInput ? (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-slate-400">🏷️</span>
              <div>
                <span className="text-[11px] font-medium text-slate-500">
                  Product
                </span>
                <p className="text-sm font-medium text-slate-900">
                  {formData.productName || (
                    <span className="italic text-slate-400">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            </div>

            {formData.productDescription && (
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-xs text-slate-400">📄</span>
                <div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Description
                  </span>
                  <p className="line-clamp-2 text-xs text-slate-600">
                    {formData.productDescription}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-slate-400">🎯</span>
              <div>
                <span className="text-[11px] font-medium text-slate-500">
                  Audience
                </span>
                <p className="text-sm text-slate-900">
                  {formData.targetAudience || (
                    <span className="italic text-slate-400">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-slate-400">🎙️</span>
              <div>
                <span className="text-[11px] font-medium text-slate-500">
                  Tone
                </span>
                <p className="text-sm capitalize text-slate-900">
                  {formData.tone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-slate-400">📱</span>
              <div>
                <span className="text-[11px] font-medium text-slate-500">
                  Platform
                </span>
                <p className="text-sm text-slate-900">
                  {platformNames[formData.platform] || formData.platform}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-xs text-slate-400">⏱️</span>
              <div>
                <span className="text-[11px] font-medium text-slate-500">
                  Duration
                </span>
                <p className="text-sm text-slate-900">{formData.duration}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="mb-2 text-2xl">👆</span>
            <p className="text-xs text-slate-400">
              Isi form di panel kiri untuk melihat preview
            </p>
          </div>
        )}
      </div>

      {/* Format Templates */}
      <div className="space-y-2.5">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>📋</span> Format Template
        </h3>
        <div className="space-y-1.5">
          {formatTemplates.map((fmt) => (
            <label
              key={fmt.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-all hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500/20"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <div>
                <span className="text-sm font-medium text-slate-900">
                  {fmt.label}
                </span>
                <p className="text-xs text-slate-500">{fmt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Token Usage */}
      {hasInput && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              📊 Token Usage
            </span>
            <span className="text-xs font-medium text-slate-900">
              ~120 tokens
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLoading ? "w-2/3 animate-pulse bg-blue-500" : "w-1/3 bg-emerald-500"
              }`}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Estimasi: 5 hooks × ~24 tokens/hook
          </p>
        </div>
      )}

      {/* Divider for mobile */}
      <div className="mt-auto border-t border-slate-200 pt-3 text-center text-[11px] text-slate-400 md:hidden">
        Geser ke bawah untuk hasil 👇
      </div>
    </div>
  );
}
