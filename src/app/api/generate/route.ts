import { NextRequest, NextResponse } from "next/server";
import type { FormData, HookData } from "@/types/hook";
import { TONE_LABELS, PLATFORM_NAMES } from "@/types/hook";

// Mock generator (fallback)
function mockGenerateHooks(data: FormData): HookData[] {
  const toneLabel = TONE_LABELS[data.tone] || data.tone;
  return [
    {
      id: "hook-1",
      category: "Emotional",
      categoryIcon: "🔥",
      text: `${toneLabel}: Bayangkan menikmati kehangatan di setiap momen — hanya ${data.productName} yang bisa memberikan itu.`,
      charLength: 120,
      readability: "Easy",
      isFavorite: false,
    },
    {
      id: "hook-2",
      category: "Curiosity",
      categoryIcon: "🤔",
      text: `Apa yang dilakukan para ${data.targetAudience || "profesional"} setiap pagi? Rahasianya adalah ${data.productName}.`,
      charLength: 110,
      readability: "Easy",
      isFavorite: false,
    },
    {
      id: "hook-3",
      category: "Problem-Solution",
      categoryIcon: "🛠️",
      text: `Lelah dengan hasil biasa? ${data.productName} hadir dengan solusi yang berbeda — kualitas yang terasa.`,
      charLength: 115,
      readability: "Easy",
      isFavorite: false,
    },
  ];
}

// Call external AI endpoint
async function callAIEndpoint(data: FormData, endpoint: string): Promise<HookData[]> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`AI endpoint error: ${response.status}`);
  }
  const json = await response.json();
  // Expect { hooks: HookData[] } or array directly
  if (Array.isArray(json)) return json;
  if (json.hooks && Array.isArray(json.hooks)) return json.hooks;
  throw new Error("Unexpected response format from AI endpoint");
}

// Call Google Gemini via its OpenAI-compatible endpoint
async function callGemini(data: FormData, apiKey: string): Promise<HookData[]> {
  const prompt = `Generate 5 ad hooks (in Indonesian) for a product.
Product: ${data.productName}
Description: ${data.productDescription}
Target audience: ${data.targetAudience || "general"}
Tone: ${TONE_LABELS[data.tone] || data.tone}
Platform: ${PLATFORM_NAMES[data.platform] || data.platform}
Duration: ${data.duration}

Return only a JSON array of 5 objects with fields: id (string), category (string), categoryIcon (string, one emoji), text (string, the hook in Indonesian, max 150 chars), charLength (number), readability ("Easy"|"Medium"|"Hard"), isFavorite (false).
Use these categories: Emotional, Curiosity, Statistical, Problem-Solution, AIDA, PAS, Before-After-Bridge, FAB.
Generate creative, compelling hooks. No markdown, no explanation.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an expert copywriter specializing in ad hooks. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in Gemini response");
  return parseHooksFromContent(content);
}

// Extract a JSON array of hooks from model output (handles markdown fences etc.)
function parseHooksFromContent(content: string): HookData[] {
  const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in model response");
    parsed = JSON.parse(match[0]);
  }
  if (!Array.isArray(parsed)) throw new Error("Model response is not an array");
  return parsed as HookData[];
}

// Call OpenAI
async function callOpenAI(data: FormData, apiKey: string): Promise<HookData[]> {
  const prompt = `Generate 5 ad hooks for a product. 
Product: ${data.productName}
Description: ${data.productDescription}
Target audience: ${data.targetAudience || "general"}
Tone: ${data.tone}
Platform: ${data.platform}
Duration: ${data.duration}

Return only a JSON array of objects with fields: id (string), category (string), categoryIcon (string), text (string), charLength (number), readability ("Easy"|"Medium"|"Hard"), isFavorite (boolean).
Use these categories: Emotional, Curiosity, Statistical, Problem-Solution, AIDA, PAS, Before-After-Bridge, FAB.
Generate creative, compelling hooks.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert copywriter specializing in ad hooks. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in OpenAI response");
  // Parse JSON from response (may be wrapped in markdown)
  const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
  const hooks = JSON.parse(cleaned);
  if (!Array.isArray(hooks)) throw new Error("OpenAI response is not an array");
  return hooks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body as FormData;

    // Validate required fields
    if (!data.productName || !data.productDescription) {
      return NextResponse.json(
        { error: "Product name and description are required" },
        { status: 400 }
      );
    }

    let hooks: HookData[];

    // Try external AI endpoint first
    const aiEndpoint = process.env.AI_ENDPOINT;
    if (aiEndpoint) {
      try {
        hooks = await callAIEndpoint(data, aiEndpoint);
      } catch (err) {
        console.error("AI endpoint failed:", err);
        // Fallback to mock
        hooks = mockGenerateHooks(data);
      }
    } else if (process.env.GEMINI_API_KEY) {
      try {
        hooks = await callGemini(data, process.env.GEMINI_API_KEY);
      } catch (err) {
        console.error("Gemini failed:", err);
        hooks = mockGenerateHooks(data);
      }
    } else if (process.env.OPENAI_API_KEY) {
      try {
        hooks = await callOpenAI(data, process.env.OPENAI_API_KEY);
      } catch (err) {
        console.error("OpenAI failed:", err);
        hooks = mockGenerateHooks(data);
      }
    } else {
      // No AI configured, use mock
      hooks = mockGenerateHooks(data);
    }

    return NextResponse.json({ hooks });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}