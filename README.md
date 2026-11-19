# 🧠 MIND AI — Modern Developer Workspace & Research Copilot
### Built for the Google × Firebase #BuildHybridAI 2026 Hackathon (Deadline: November 30, 2026)

MIND AI is an intelligent research workspace built with **Next.js (App Router)**, **Tailwind CSS**, **Cloud Firestore**, and **Google Gemini 2.5 Flash**. It combines local-first editing speed with cloud persistence and contextual AI queries.

---

## ✨ Features & Architecture

- **Visual & UI Style**: Dark editorial aesthetic with **Anton** (bold display titles) and **Inter** (crisp UI and note text) from Google Fonts.
- **Top Navigation**: Displays the **MIND AI** brand, real-time search filter, live Firestore status, and primary **"+ New Note"** button.
- **Left Sidebar**: Quick navigation across saved notes with preview snippets, tag filtering (`#Architecture`, `#Firebase`, `#Gemini`), timestamps, and pin toggles.
- **Main Note Canvas**:
  - Live title & Markdown editor with instant auto-save to Firestore.
  - **Full Markdown Preview Mode**: Clean typographic rendering without raw `#` or `**` symbols using `react-markdown`.
  - Multi-tag management and pin/delete controls.
- **"Ask Mind" AI Sidebar**:
  - **Summarize Note**: Generates a high-density 3-bullet executive summary via `/api/mind`.
  - **Ask Mind Chat**: Asks questions grounded directly in workspace documents with note citations.
- **Zero-Friction Fallback**: Works immediately in Developer Demo mode with sample notes even before environment variables are configured.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Firebase and Gemini credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
Ready to deploy on **Vercel** or **Firebase App Hosting**.
