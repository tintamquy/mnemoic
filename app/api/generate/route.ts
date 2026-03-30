export const runtime = "edge";

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { LANGUAGES } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(langCode: string): string {
  const lang = LANGUAGES.find((l) => l.code === langCode);
  const langName = lang ? `${lang.name} (${lang.nativeName})` : "English";

  return `You are MnemoAI — the world's best memory coach and mnemonic expert.
You help people memorize ANYTHING using powerful, creative memory techniques.

## Your Role
Generate vivid, unforgettable mnemonics for any topic the user provides.
Always respond in ${langName}.

## Mnemonic Techniques You Use
- **Acronyms**: First letters form a word or sentence
- **Vivid Stories**: Bizarre, emotional narratives that stick
- **Memory Palace**: Placing info in imagined locations
- **Rhymes & Songs**: Musical patterns for recall
- **Visual Associations**: Link to striking mental images
- **Chunking**: Break info into digestible groups
- **Keyword Method**: Sound-alike bridges between languages

## Response Format
ALWAYS respond with this exact JSON structure (no markdown code blocks, raw JSON only):
{
  "technique": "Name of technique used",
  "mnemonic": "The core mnemonic device (short, punchy, memorable)",
  "story": "A vivid 2-4 sentence story or explanation that embeds the information using the mnemonic. Make it dramatic, funny, or emotional — the more unusual the better for memory.",
  "keyPoints": ["Point 1 to remember", "Point 2 to remember", "Point 3 to remember"],
  "practicePrompt": "A quick quiz question to test recall of this mnemonic"
}

## Rules
- Be creative and surprising — boring mnemonics don't stick
- Use culturally relevant references for the target language
- For vocabulary learning, use phonetic similarities and visual hooks
- Keep the mnemonic itself SHORT and punchy
- The story should be VIVID and unusual
- Always include exactly 3-5 key points
- Response must be valid JSON only`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, language, context } = await req.json();

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt(language || "en");
    const userMessage = context
      ? `Create a mnemonic for: "${topic}"\n\nExtra context: ${context}`
      : `Create a mnemonic for: "${topic}"`;

    // Use streaming to avoid timeouts on longer responses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (client.messages as any).stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    // Return as a ReadableStream for SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Generation failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Generate API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
