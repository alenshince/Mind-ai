/**
 * app/api/mind/route.ts
 * 
 * Next.js App Router API Route for Mind AI.
 * Connects to Google's Gemini API (gemini-2.5-flash) to power:
 * 1. Note Summarization (action: 'summarize')
 * 2. Grounded Workspace Q&A (action: 'chat')
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, activeNote, notes = [], query = "" } = body;

    // Fallback simulation if GEMINI_API_KEY is not yet configured
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(generateSimulatedResponse(action, activeNote, notes, query));
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // ACTION: SUMMARIZE ACTIVE NOTE
    if (action === "summarize") {
      if (!activeNote || !activeNote.content) {
        return NextResponse.json({ error: "Active note content is required to summarize" }, { status: 400 });
      }

      const prompt = `You are Mind AI, an ultra-crisp workspace copilot for the Google × Firebase Hackathon.
Summarize the following developer note into 3-4 concise, high-impact bullet points and extract 2-3 key tags:

Title: ${activeNote.title}
Tags: ${(activeNote.tags || []).join(", ")}
Content:
${activeNote.content}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });

      return NextResponse.json({
        summary: response.text,
        isSimulated: false,
      });
    }

    // ACTION: CHAT / GROUNDED Q&A
    if (action === "chat") {
      if (!query.trim()) {
        return NextResponse.json({ error: "Query cannot be empty" }, { status: 400 });
      }

      // Compile notes into grounded context
      const contextDocs = (notes as any[]).map((n, i) => `
[Note #${i + 1}] "${n.title}" (Tags: ${(n.tags || []).join(", ")})
Content:
${n.content}
---`).join("\n");

      const systemInstruction = `You are "Mind AI", an intelligent research assistant built for the Google × Firebase #BuildHybridAI 2026 Hackathon.
Your knowledge is strictly grounded in the user's workspace notes provided below.
Rules:
1. Direct, high-density, developer-grade answers formatted in clean Markdown.
2. Always cite which note(s) informed your answer using the format "[Note: Note Title]".
3. If the user asks about code or architecture, provide concrete examples.`;

      const prompt = `WORKSPACE NOTES CONTEXT:
${contextDocs}

ACTIVE NOTE IN FOCUS:
${activeNote ? `Title: "${activeNote.title}"\nContent:\n${activeNote.content}` : "None"}

USER QUESTION:
${query}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      // Extract cited note titles from notes that match query or response
      const citedNotes = notes
        .filter((n: any) => response.text?.toLowerCase().includes(n.title.toLowerCase()) || query.toLowerCase().includes(n.title.toLowerCase()))
        .map((n: any) => n.title);

      return NextResponse.json({
        answer: response.text,
        sources: citedNotes.length > 0 ? citedNotes : [activeNote?.title].filter(Boolean),
        isSimulated: false,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'summarize' or 'chat'." }, { status: 400 });
  } catch (error: any) {
    console.error("[Mind AI API Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI query", isSimulated: true },
      { status: 500 }
    );
  }
}

/**
 * Intelligent simulation fallback when no GEMINI_API_KEY is provided in .env
 */
function generateSimulatedResponse(action: string, activeNote: any, notes: any[], query: string) {
  if (action === "summarize") {
    return {
      summary: `• **Core Architecture**: Explores client-first caching synchronized with Cloud Firestore in real time.
• **AI Augmentation**: Leverages Gemini 2.5 Flash for sub-second workspace indexing and synthesis.
• **Editorial Design**: Anton display headers and Inter body typography for high-density readability.`,
      isSimulated: true,
      notice: "Demo Mode: Add GEMINI_API_KEY in .env.local to activate live Gemini Flash responses."
    };
  }

  // Chat action simulation
  const matched = notes.find((n: any) => 
    query.toLowerCase().includes(n.title.toLowerCase()) || 
    (n.tags && n.tags.some((t: string) => query.toLowerCase().includes(t.toLowerCase())))
  ) || activeNote || notes[0];

  return {
    answer: `Based on your workspace notes (specifically **[Note: ${matched?.title || 'Active Note'}]**):

1. **Grounded Synthesis**: Your workspace links client-side optimistic updates directly to Cloud Firestore \`onSnapshot\` streams.
2. **Context Packaging**: Documents are indexed directly into the Gemini 2.5 Flash prompt for zero-latency retrieval.
3. **Hackathon Alignment**: Fully complies with the Google × Firebase #BuildHybridAI 2026 specs.

*Add your \`GEMINI_API_KEY\` in \`.env.local\` to enable live streaming from Google AI.*`,
    sources: [matched?.title || "Active Workspace"],
    isSimulated: true,
  };
}
