/**
 * Typed Anthropic SDK wrapper.
 *
 * Centralises prompt-caching defaults, model selection, and the `max_tokens`
 * gotcha (SDK requires it — default 4096 here for general tasks).
 */
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("ANTHROPIC_API_KEY is required. Get a key at console.anthropic.com.");
}

export const claude = new Anthropic({ apiKey });

/** Current recommended models. Override with env to pin. */
export const MODELS = {
  fast: process.env.CLAUDE_FAST_MODEL ?? "claude-haiku-4-5-20251001",
  smart: process.env.CLAUDE_SMART_MODEL ?? "claude-sonnet-4-6",
  strongest: process.env.CLAUDE_STRONGEST_MODEL ?? "claude-opus-4-7",
} as const;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Single-shot chat completion. Returns only the text content. */
export async function chat(
  messages: ChatMessage[],
  opts: {
    model?: string;
    system?: string;
    maxTokens?: number;
  } = {},
): Promise<string> {
  const res = await claude.messages.create({
    model: opts.model ?? MODELS.smart,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages,
  });

  return res.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
