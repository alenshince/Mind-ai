/**
 * lib/firebase.ts
 * 
 * Firebase Authentication & Firestore configuration for Mind AI.
 * Includes graceful fallback to local memory / sample notes when 
 * NEXT_PUBLIC_FIREBASE_* environment variables are not yet provided.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

// Initial sample notes for the Google × Firebase #BuildHybridAI 2026 Hackathon
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary?: string;
  updatedAt: string;
  isPinned?: boolean;
}

export const SAMPLE_NOTES: Note[] = [
  {
    id: "sample-1",
    title: "Hybrid AI Architecture & Firestore Sync",
    tags: ["Architecture", "Firebase", "Gemini"],
    updatedAt: "2026-11-23T10:00:00.000Z",
    isPinned: true,
    summary: "Blueprints for pairing client-side reactive state with Firestore onSnapshot listeners and Gemini 2.5 Flash for sub-second workspace answers.",
    content: `# Mind AI: Hybrid System Architecture
 
## The Vision
Mind AI is an intelligent workspace designed for the Google × Firebase #BuildHybridAI 2026 Hackathon. It merges local-first speed with real-time cloud collaboration and contextual AI reasoning.

### Key Pillars:
1. **Instant Feedback**: Note edits update optimistically on the client with zero latency.
2. **Cloud Resilience**: Cloud Firestore synchronizes documents across devices in real time with snapshot listeners.
3. **Context-Aware Intelligence**: Google Gemini 2.5 Flash indexes workspace notes to answer queries, summarize blueprints, and explain code snippets.`
  },
  {
    id: "sample-2",
    title: "Gemini 2.5 Flash Multi-Doc Context Strategy",
    tags: ["Gemini", "AI", "Prompting"],
    updatedAt: "2026-11-23T09:30:00.000Z",
    isPinned: false,
    summary: "Technique for packaging active workspace notes into Gemini's context window without lossy chunking.",
    content: `# Gemini 2.5 Flash Context Integration

Instead of relying on lossy vector embeddings for personal workspaces, we leverage **Gemini 2.5 Flash's 1M+ token context window** to ingest raw notes with structural anchors:

- **Tagged Context Blocks**: Each note is prefixed with title, tags, and last-modified metadata.
- **Active Focus Priority**: The note currently open in the canvas receives primary weighting in system prompts.
- **Source Attribution**: Answers cite the exact note title to ensure verifiable, trustworthy assistance.`
  },
  {
    id: "sample-3",
    title: "Editorial Design System Guidelines",
    tags: ["Design", "Tailwind", "Typography"],
    updatedAt: "2026-11-23T08:00:00.000Z",
    isPinned: false,
    summary: "Dark editorial styling guidelines using Anton and Inter typography.",
    content: `# Mind AI Editorial Design System

- **Background Palette**: Deep charcoal \`#0A0A0C\` base with \`#121318\` surface cards.
- **Borders**: Hairline 1px borders at \`rgba(255, 255, 255, 0.08)\`.
- **Accent**: Electric Emerald / Cyan glow for interactive states.
- **Display Typography**: **Anton** for bold headers, uppercase labels, and brand identity.
- **Body Typography**: **Inter** for crisp, highly readable markdown text and note bodies.`
  }
];

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if credentials have been populated
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "your_api_key_here"
);

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("[Mind AI] Firebase initialization error. Falling back to local mode:", error);
  }
}

export { auth, db, googleProvider };

// Helper: Sign In with Google
export async function loginWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    // Return mock demo user
    return {
      uid: "demo-user-1",
      displayName: "Alex Rivers",
      email: "demo@mindai.workspace",
      photoURL: "https://api.dicebear.com/7.x/identicon/svg?seed=mindai",
      isDemo: true,
    };
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Helper: Sign Out
export async function logoutUser() {
  if (auth && isFirebaseConfigured) {
    await signOut(auth);
  }
  return true;
}

// Helper: Save Note to Firestore (with optimistic return)
export async function saveNoteToFirestore(note: Note) {
  if (!isFirebaseConfigured || !db) {
    return note;
  }
  try {
    const noteRef = doc(db, "notes", note.id);
    await setDoc(noteRef, {
      ...note,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return note;
  } catch (err) {
    console.error("[Mind AI] Failed to save note to Firestore:", err);
    return note;
  }
}

// Helper: Delete Note from Firestore
export async function deleteNoteFromFirestore(noteId: string) {
  if (!isFirebaseConfigured || !db) {
    return true;
  }
  try {
    await deleteDoc(doc(db, "notes", noteId));
    return true;
  } catch (err) {
    console.error("[Mind AI] Failed to delete note from Firestore:", err);
    return false;
  }
}
