// ─────────────────────────────────────────────
// Shared Types for HookLab AI
// ─────────────────────────────────────────────

export interface FormData {
  productName: string;
  productDescription: string;
  targetAudience: string;
  tone: string;
  platform: string;
  duration: string;
}

export interface HookData {
  id: string;
  category: string;
  categoryIcon: string;
  text: string;
  charLength: number;
  readability: "Easy" | "Medium" | "Hard";
  isFavorite: boolean;
}

export interface GenerationResult {
  hooks: HookData[];
  tokensUsed: number;
  modelUsed: string;
}

// Tone display labels mapped from internal values
export const TONE_LABELS: Record<string, string> = {
  professional: "Professional",
  casual: "Casual",
  urgent: "Urgent",
  humorous: "Humorous",
  luxury: "Luxury / Premium",
  empathetic: "Empathetic",
  custom: "Custom",
};

export const PLATFORM_NAMES: Record<string, string> = {
  meta: "Meta Ads",
  tiktok: "TikTok",
  instagram: "Instagram Reels",
  youtube: "YouTube Shorts",
};
