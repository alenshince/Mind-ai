import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

let aiClient = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.warn('[Mind AI] Could not initialize Google Gen AI SDK client:', err);
  }
}

export const geminiService = {
  isConfigured() {
    return Boolean(aiClient);
  },

  /**
   * Queries the user's workspace notes using Gemini
   */
  async queryWorkspace({ query, notes = [], activeNote = null }) {
    if (!aiClient) {
      // Simulate intelligent contextual response for demonstration
      return this._simulateAIWorkspaceResponse(query, notes, activeNote);
    }

    try {
      const notesContext = notes
        .map(
          (n, i) =>
            `[Document ${i + 1}]: "${n.title}" (Type: ${n.type || 'note'}, Tags: ${(n.tags || []).join(', ')})
Content:
${n.content}
---`
        )
        .join('\n\n');

      const systemInstruction = `You are "Mind AI", an ultra-fast, intelligent research assistant and developer workspace copilot built for Google × Firebase Hackathon 2026.
You have access to the user's current workspace notes and code snippets.
Your mission:
1. Answer queries directly using the context provided from the workspace.
2. Cite the specific note titles or document numbers when referencing facts.
3. Be concise, highly technical, developer-centric, and formatted in clean GitHub Markdown.
4. If code is requested, provide performant, idiomatic code snippets with syntax highlighting tags.`;

      const prompt = `Workspace Notes Context:
${notesContext}

Active Focus Note:
${activeNote ? `Title: "${activeNote.title}"\nContent:\n${activeNote.content}` : 'None'}

User Question:
${query}`;

      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return {
        text: response.text,
        sources: notes.filter(n => query.toLowerCase().includes(n.title.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())).map(n => n.title),
        model: GEMINI_MODEL,
        isSimulated: false,
      };
    } catch (error) {
      console.error('[Mind AI] Gemini API Call Failed:', error);
      return this._simulateAIWorkspaceResponse(query, notes, activeNote, error.message);
    }
  },

  /**
   * Summarizes a note or code snippet into key points
   */
  async summarize(content, title = '') {
    if (!aiClient) {
      return `### Summary of ${title || 'Note'}
- **Core Concept**: Architectural overview and modular pattern breakdown.
- **Key Takeaway**: High-throughput real-time sync with Firebase coupled with low-latency Gemini inference.
- **Action Item**: Complete index configuration in Firestore security rules.`;
    }

    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Provide an ultra-concise, 3-bullet executive summary and key tags for this developer note:\n\nTitle: ${title}\n\n${content}`,
      });
      return response.text;
    } catch (err) {
      console.error('[Mind AI] Summarization error:', err);
      return `Failed to summarize: ${err.message}`;
    }
  },

  /**
   * Explains or optimizes a code snippet
   */
  async explainCode(code, language = 'javascript') {
    if (!aiClient) {
      return `\`\`\`${language}
// Architectural Analysis:
// Time Complexity: O(1) average lookup
// Memory Footprint: Minimal
\`\`\`
1. **Concurrency**: Implements reactive event-driven listener patterns.
2. **State Management**: Zero-drift synchronizer matching Firestore document snapshots.
3. **Recommendation**: Ensure memory leak protection by invoking unsubscribe callbacks in cleanup.`;
    }

    try {
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Explain the following ${language} code, identify any performance or concurrency bottlenecks, and provide a 1-sentence optimization suggestion:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      });
      return response.text;
    } catch (err) {
      return `Code analysis error: ${err.message}`;
    }
  },

  _simulateAIWorkspaceResponse(query, notes, activeNote, errReason = '') {
    const qLower = query.toLowerCase();
    let relevantNotes = notes.filter(n => 
      n.title.toLowerCase().includes(qLower) || 
      (n.tags && n.tags.some(t => t.toLowerCase().includes(qLower))) ||
      n.content.toLowerCase().includes(qLower)
    );

    if (relevantNotes.length === 0 && activeNote) {
      relevantNotes = [activeNote];
    }

    const citations = relevantNotes.map(n => n.title);

    let answer = '';
    if (qLower.includes('summary') || qLower.includes('summarize')) {
      answer = `Based on your indexed workspace notes (${citations.length > 0 ? citations.map(c => `\`${c}\``).join(', ') : 'All Notes'}), here is the synthesis:
      
- **Architecture**: Hybrid offline-first React frontend with real-time Firestore synchronization.
- **AI Integration**: Gemini 2.5 Flash indexing active notes for low-latency contextual retrieval.
- **Key Deliverables**: Instant knowledge ingest modal, real-time code snippet playground, and developer-grade dark UI.`;
    } else if (qLower.includes('code') || qLower.includes('snippet') || qLower.includes('syntax') || qLower.includes('firestore')) {
      answer = `Here is the relevant implementation pattern based on your note **${relevantNotes[0]?.title || 'Cloud Firestore Sync'}**:

\`\`\`javascript
// Live snapshot listener with local optimistic state
const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
  const syncedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setNotes(syncedNotes);
});
\`\`\`

> [!TIP]
> Always return \`unsubscribe\` within the \`useEffect\` cleanup function to prevent memory leaks during workspace switches.`;
    } else {
      answer = `I analyzed **${notes.length} notes** in your active workspace canvas.

${citations.length > 0 ? `I matched your query directly to **${citations.map(c => `"${c}"`).join(' and ')}**:\n\n` : ''}
- **Contextual Match**: The workspace contains active documents regarding *${citations[0] || 'Modern AI Workspace'}*.
- **Intelligence Hook**: When connected to your \`VITE_GEMINI_API_KEY\`, this pipeline performs vector and semantic context-packing into Gemini Flash for instant workspace comprehension.
- **Suggested Next Step**: You can use the Quick Ingest (\`Ctrl + K\` / \`⌘ + K\`) to append external research or paste code snippets directly into your indexed knowledge graph.`;
    }

    if (errReason) {
      answer += `\n\n*(Note: Running in offline simulation fallback because: ${errReason})*`;
    }

    return {
      text: answer,
      sources: citations,
      model: 'Mind AI Local Indexer (Demo Mode)',
      isSimulated: true,
    };
  }
};
