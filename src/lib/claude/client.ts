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
  } catch {
    // Fallback: try to extract the JSON object with regex
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // Second fallback: fix common JSON issues (unescaped quotes in strings)
        try {
          const fixed = jsonMatch[0]
            .replace(/[\x00-\x1f]/g, " ") // Remove control characters
            .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
            .replace(/\u2018|\u2019/g, "'") // Curly single quotes → straight
            .replace(/\u201C|\u201D/g, '\\"') // Curly double quotes → escaped
            .replace(/\u2014/g, "--") // Em dash → double hyphen
            .replace(/\u2013/g, "-"); // En dash → hyphen
          return JSON.parse(fixed) as T;
        } catch (innerErr) {
          console.error("[claude] Failed to parse JSON after fixes:", cleaned.slice(0, 500));
          throw new Error(`Claude returned invalid JSON: ${(innerErr as Error).message}`);
        }
      }
    }
    console.error("[claude] No JSON object found in response:", cleaned.slice(0, 500));
    throw new Error("Claude response did not contain a valid JSON object");
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
