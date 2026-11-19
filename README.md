# 🧠 Mind AI — Intelligent Developer Workspace & Research Assistant
### Built for Google × Firebase #BuildHybridAI 2026 Hackathon

Mind AI is an ultra-fast, intelligent research assistant and developer note-taking workspace designed to bridge local speed with cloud persistence and contextual AI reasoning.

---

## ⚡ Core Features
1. **Interactive Workspace Canvas**:
   - Organize notes, blueprints, and code snippets across split-pane or card-grid layouts.
   - Pinned priorities, live tag filtering, and code language recognition (JS, TS, Python, Bash, HTML, JSON).
2. **Instant Knowledge Ingest (`⌘K` / `Ctrl+K`)**:
   - Rapid-fire modal to paste references, documentation, or snippets directly into your indexed graph.
3. **"Ask Mind" Contextual AI Copilot**:
   - Powered by **Google Gemini 2.5 Flash**.
   - Indexes active workspace documents into context prompts for zero-loss semantic retrieval, summarization, and code explanations with source citations.
4. **Cloud Firestore & Firebase Auth**:
   - Real-time Firestore snapshot synchronization with offline cache persistence.
   - Google & Email Authentication with built-in Developer Demo fallback mode.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Vite
- **Database & Sync**: Cloud Firestore (`onSnapshot` real-time listeners)
- **Authentication**: Firebase Auth (Google Auth Provider + Email)
- **AI Core**: Google Gen AI SDK (`@google/genai` / Gemini 2.5 Flash)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Firebase and Gemini credentials:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-2.5-flash
```

*(Note: Mind AI includes an intelligent Developer Preview mode that runs immediately with mock state even before adding live API keys!)*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## ⌨️ Developer Shortcuts
- `⌘K` or `Ctrl+K`: Trigger Instant Knowledge Ingest dialog
- `⌘B` or `Ctrl+B`: Toggle navigation sidebar
- `⌘M` or `Ctrl+M`: Toggle "Ask Mind" AI Copilot drawer
