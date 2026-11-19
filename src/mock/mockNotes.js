export const INITIAL_MOCK_NOTES = [
  {
    id: 'note-01',
    title: 'Hybrid AI Architecture for Hackathon 2026',
    type: 'research',
    tags: ['Architecture', 'Firebase', 'Gemini', 'HybridAI'],
    pinned: true,
    summary: 'Core design blueprint combining client-side local caching, Firestore real-time updates, and Gemini 2.5 Flash context streaming.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    content: `# Mind AI: Hybrid Architecture Blueprint

## System Overview
The goal of **Mind AI** is to provide an ultra-responsive developer workspace that combines local-first responsiveness with cloud resilience and contextual AI intelligence.

### Three-Tier Synergy:
1. **Edge Client (React + Tailwind v4)**:
   - Zero-latency optimistic UI updates.
   - Keyboard-first command palette (\`Ctrl+K\`).
   - Split-pane contextual research canvas.

2. **Real-time Synchronization (Cloud Firestore)**:
   - Atomic document mutations with sub-second fanout.
   - Cross-device workspace synchronization with offline cache persistence.
   - Pinned priorities and tag indexing.

3. **Contextual Copilot (Google Gemini 2.5 Flash)**:
   - Dynamic prompt synthesis packing active notes into the working context.
   - Code explanation, markdown refactoring, and multi-document synthesis.
   - Sub-300ms time-to-first-token streaming.`,
  },
  {
    id: 'note-02',
    title: 'Firestore Real-time Listener Pattern',
    type: 'code',
    language: 'javascript',
    tags: ['Firebase', 'Firestore', 'React', 'Hooks'],
    pinned: true,
    summary: 'Production-ready React hook implementation for Firestore collection snapshot listeners with error boundaries.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    content: `// custom useWorkspaceNotes hook
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useWorkspaceNotes(userId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) return;

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('pinned', 'desc'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(items);
      setLoading(false);
    }, (error) => {
      console.error("Firestore sync failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notes, loading };
}`,
  },
  {
    id: 'note-03',
    title: 'Gemini 2.5 Multi-turn Context Packing Strategy',
    type: 'research',
    tags: ['Gemini', 'PromptEngineering', 'LLM', 'ContextWindow'],
    pinned: false,
    summary: 'Strategies for packing 50+ workspace notes into Gemini 1M+ token window with source attribution tags.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    content: `## Context Packing Strategies

When querying a workspace containing hundreds of developer notes, we leverage Gemini's massive context window with hierarchical tagging:

### Schema:
- Every note is wrapped in \`<doc id="ID" title="TITLE" tags="TAGS">\`
- Active note currently focused by user receives a 3x attention prompt weighting.
- Citation anchors: \`[Ref: doc-id]\` are mandated in system instructions to allow UI to render clickable source pills.

### Benefits:
- Zero lossy chunking compared to standard RAG embeddings.
- Direct code block citation and line-level diff generation.`,
  },
  {
    id: 'note-04',
    title: 'Developer Ergonomics & Dark Mode Design System',
    type: 'note',
    tags: ['Design', 'TailwindCSS', 'UI/UX', 'Aesthetics'],
    pinned: false,
    summary: 'Design tokens, surface contrasts, border glows, and typography choices for developer-grade tool aesthetics.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    content: `### Visual Hierarchy & Palette
- **Canvas Base**: \`#090D16\` (Deep Void Black)
- **Card Surface**: \`#0F172A\` (Dark Navy Zinc)
- **Subtle Borders**: \`rgba(255, 255, 255, 0.08)\`
- **Primary Brand Accent**: \`#6366F1\` (Electric Indigo) & \`#06B6D4\` (Cyan Neon)
- **AI Spark Glow**: \`#A855F7\` (Gemini Purple/Amethyst)

### Typography
- Primary UI: Inter / system-ui
- Monospace / Code: JetBrains Mono / Fira Code`,
  }
];

export const INITIAL_MOCK_CHAT = [
  {
    id: 'msg-1',
    role: 'assistant',
    text: "Welcome to **Mind AI**! I'm your contextual workspace assistant. I've indexed your **4 active notes** and code snippets. Ask me anything about your architecture, request code snippets, or ask for summaries.",
    timestamp: 'Just now',
    sources: [],
  }
];
