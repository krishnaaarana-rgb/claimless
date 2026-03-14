const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4.5";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Claimless",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("No response content from OpenRouter");
  }

  return data.choices[0].message.content;
}

export async function analyzeWithClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<T> {
  const text = await callOpenRouter(systemPrompt, userPrompt, options);

  // Parse JSON response — strip markdown code fences if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("[claude] Failed to parse JSON response:", cleaned.slice(0, 500));
    throw new Error(`Claude returned invalid JSON: ${(err as Error).message}`);
  }
}

export async function generateTextWithClaude(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  return callOpenRouter(systemPrompt, userPrompt, {
    ...options,
    temperature: options?.temperature ?? 0.3,
  });
}
