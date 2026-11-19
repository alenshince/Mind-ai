"use client";

/**
 * app/page.tsx
 * 
 * Mind AI — Main Workspace Studio
 * Built for the Google × Firebase #BuildHybridAI 2026 Hackathon.
 * Implements the Anton + Inter dark editorial design system, real-time
 * note organization, Firestore sync, and contextual Gemini 2.5 Flash intelligence.
 */

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Pin, 
  Trash2, 
  Save, 
  Eye, 
  Edit3, 
  Tag as TagIcon, 
  Send, 
  BookOpen, 
  Bot, 
  User, 
  X, 
  Clock, 
  Database, 
  Check, 
  ArrowRight,
  SplitSquareVertical,
  LogIn,
  LogOut
} from "lucide-react";
import { 
  Note, 
  SAMPLE_NOTES, 
  isFirebaseConfigured, 
  loginWithGoogle, 
  logoutUser, 
  saveNoteToFirestore, 
  deleteNoteFromFirestore 
} from "@/lib/firebase";

export default function MindAIWorkspace() {
  // --- State Management ---
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("mind_ai_notes_v2");
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
    }
    return SAMPLE_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(SAMPLE_NOTES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<"edit" | "preview" | "split">("edit");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [user, setUser] = useState<{ displayName?: string; email?: string } | null>({
    displayName: "Guest Developer",
    email: "guest@mindai.workspace",
  });

  // New tag input state
  const [newTagInput, setNewTagInput] = useState("");

  // AI Panel State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
    sources?: string[];
    time: string;
  }>>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Welcome to **MIND AI**. I am indexing your active workspace notes. Ask me any question about your blueprints or click **'Summarize Note'** above to generate an executive synthesis.",
      sources: [],
      time: "Now",
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Compute Active Note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Sync to local storage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("mind_ai_notes_v2", JSON.stringify(notes));
    }
  }, [notes]);

  // Extract all distinct tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filter notes by search query and tag
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesBody = note.content.toLowerCase().includes(q);
        const matchesTags = note.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBody && !matchesTags) return false;
      }
      if (selectedTag) {
        if (!note.tags || !note.tags.includes(selectedTag)) return false;
      }
      return true;
    });
  }, [notes, searchQuery, selectedTag]);

  // --- Handlers ---
  const handleUpdateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    setSaveStatus("saving");
    const updated = {
      ...activeNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    saveNoteToFirestore(updated);
    setTimeout(() => setSaveStatus("saved"), 400);
  };

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: "note-" + Date.now(),
      title: "Untitled Research Note",
      content: "# New Note\n\nWrite your thoughts, technical requirements, or paste references here...",
      tags: ["Workspace"],
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setAiSummary("");
    setCanvasMode("edit");
    saveNoteToFirestore(newNote);
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    deleteNoteFromFirestore(id);
    if (activeNoteId === id) {
      setActiveNoteId(next[0]?.id || "");
    }
  };

  const handleTogglePin = (id: string, currentPin?: boolean, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const noteToUpdate = notes.find((n) => n.id === id);
    if (!noteToUpdate) return;
    const updated = { ...noteToUpdate, isPinned: !currentPin };
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    saveNoteToFirestore(updated);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !activeNote) return;
    const tag = newTagInput.trim().replace(/^#/, "");
    if (!activeNote.tags.includes(tag)) {
      handleUpdateActiveNote({ tags: [...activeNote.tags, tag] });
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    handleUpdateActiveNote({
      tags: activeNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  // --- AI Actions ---
  const handleSummarizeNote = async () => {
    if (!activeNote || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          activeNote,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error("Summarization error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskMind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = {
      id: "user-" + Date.now(),
      role: "user" as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentQuery = chatInput.trim();
    setChatInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          query: currentQuery,
          activeNote,
          notes,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          role: "assistant",
          text: data.answer || "No response received.",
          sources: data.sources || [],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          text: `⚠️ Query failed: ${err.message}`,
          time: "Now",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAuthClick = async () => {
    if (user?.email && user.email !== "guest@mindai.workspace") {
      await logoutUser();
      setUser({ displayName: "Guest Developer", email: "guest@mindai.workspace" });
    } else {
      const u = await loginWithGoogle();
      if (u) setUser(u);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0C] text-[#E4E4E7] font-inter">
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Anton Display Header + Search + Action Button)
         ========================================================================= */}
      <header className="h-16 border-b border-white/[0.08] bg-[#0E0F14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Brand & Hackathon Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-anton text-2xl tracking-wider text-white uppercase flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              MIND AI
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold tracking-wider">
              2026
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/[0.08] text-xs text-zinc-400 font-mono">
            <span>Google × Firebase #BuildHybridAI</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative flex items-center w-full bg-[#14151C] border border-white/[0.08] focus-within:border-emerald-500/60 rounded-lg px-3.5 py-1.5 transition-all">
            <Search className="w-4 h-4 text-zinc-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes by title, tag, or content..."
              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-zinc-500 hover:text-white text-xs ml-1"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* New Note Button */}
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Note</span>
          </button>

          {/* User Session Pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
            <button
              onClick={handleAuthClick}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#14151C] hover:bg-[#1A1C26] border border-white/[0.08] text-xs text-zinc-300 transition-colors"
              title="Click to sign in with Google or toggle guest session"
            >
              <Database className={`w-3.5 h-3.5 ${isFirebaseConfigured ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="font-mono text-[11px] hidden sm:inline">
                {isFirebaseConfigured ? "Firestore Live" : "Demo Mode"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE LAYOUT (3 Columns: Left List + Central Canvas + AI Panel)
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---------------------------------------------------------------------
            2. LEFT SIDEBAR: NOTE LIST
           --------------------------------------------------------------------- */}
        <aside className="w-72 lg:w-80 bg-[#0E0F14] border-r border-white/[0.08] flex flex-col shrink-0 select-none">
          {/* Sidebar Header & Tag Pills */}
          <div className="p-3.5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              <span className="font-anton text-xs tracking-wider text-zinc-300">
                Workspace Index
              </span>
              <span>{filteredNotes.length} saved</span>
            </div>

            {/* Tag Quick Filters */}
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-black font-semibold"
                        : "bg-[#181922] text-zinc-400 hover:text-white border border-white/[0.05]"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] font-mono text-emerald-400 hover:underline px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notes Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No matching notes found.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setAiSummary("");
                    }}
                    className={`group relative rounded-xl p-3 transition-all cursor-pointer flex flex-col gap-1 border ${
                      isActive
                        ? "bg-[#161822] border-emerald-500/80 shadow-md shadow-emerald-500/5"
                        : "bg-[#12131A] hover:bg-[#151722] border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    {/* Header Row: Title & Action icons */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-xs text-white group-hover:text-emerald-300 truncate transition-colors">
                        {note.title || "Untitled Note"}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Pin */}
                        <button
                          onClick={(e) => handleTogglePin(note.id, note.isPinned, e)}
                          className={`p-1 rounded transition-colors ${
                            note.isPinned 
                              ? "text-emerald-400" 
                              : "text-zinc-600 group-hover:text-zinc-400"
                          }`}
                          title={note.isPinned ? "Unpin note" : "Pin note to top"}
                        >
                          <Pin className={`w-3 h-3 ${note.isPinned ? "fill-emerald-400" : ""}`} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 text-zinc-500 transition-all"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Snippet */}
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {note.summary || note.content.slice(0, 90).replace(/[#*`]/g, "") || "Empty note content..."}
                    </p>

                    {/* Footer Row: Tags & Timestamp */}
                    <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-white/[0.04] text-[10px] font-mono text-zinc-500">
                      <div className="flex items-center gap-1 truncate max-w-[150px]">
                        {(note.tags || []).slice(0, 2).map((t) => (
                          <span key={t} className="px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(note.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ---------------------------------------------------------------------
            3. MAIN NOTE CANVAS: TITLE, BODY, MARKDOWN PREVIEW, TAGS
           --------------------------------------------------------------------- */}
        <main className="flex-1 flex flex-col bg-[#0A0A0C] overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Canvas Controls Sub-header */}
              <div className="h-12 px-6 border-b border-white/[0.08] bg-[#0E0F14] flex items-center justify-between select-none">
                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-[#14151D] p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    onClick={() => setCanvasMode("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      canvasMode === "edit"
                        ? "bg-white/[0.08] text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setCanvasMode("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      canvasMode === "preview"
                        ? "bg-white/[0.08] text-emerald-300 font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setCanvasMode("split")}
                    className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      canvasMode === "split"
                        ? "bg-white/[0.08] text-white font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <SplitSquareVertical className="w-3 h-3" />
                    <span>Split</span>
                  </button>
                </div>

                {/* Save Status & Pin Indicator */}
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" />
                    {saveStatus === "saving" ? "Saving..." : "Auto-saved to Firestore"}
                  </span>
                  <button
                    onClick={() => handleTogglePin(activeNote.id, activeNote.isPinned)}
                    className="p-1 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-white"
                    title="Toggle Pin"
                  >
                    <Pin className={`w-3.5 h-3.5 ${activeNote.isPinned ? "fill-emerald-400 text-emerald-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Note Content Area */}
              <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto space-y-4 max-w-4xl w-full mx-auto">
                {/* Title Input */}
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="Note Title..."
                  className="font-anton text-3xl tracking-wide uppercase text-white bg-transparent focus:outline-none placeholder-zinc-600"
                />

                {/* Tag Pills & Tag Add Form */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-b border-white/[0.06] pb-3">
                  <TagIcon className="w-3.5 h-3.5 text-zinc-500 mr-1" />
                  {activeNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#161822] text-emerald-300 border border-emerald-900/40"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 ml-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <form onSubmit={handleAddTag} className="inline-flex items-center">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="+ add tag"
                      className="bg-transparent text-[11px] font-mono text-zinc-400 placeholder-zinc-600 focus:outline-none focus:text-white w-20 px-1"
                    />
                  </form>
                </div>

                {/* Editor / Markdown Body */}
                <div className="flex-1 flex min-h-[420px]">
                  {/* EDIT MODE */}
                  {canvasMode === "edit" && (
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                      placeholder="# Start typing your note in Markdown..."
                      className="w-full flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none font-mono leading-relaxed p-1"
                    />
                  )}

                  {/* PREVIEW MODE (Clean Markdown Rendering - No raw # or **) */}
                  {canvasMode === "preview" && (
                    <div className="w-full flex-1 markdown-body text-sm leading-relaxed text-zinc-300">
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* SPLIT MODE */}
                  {canvasMode === "split" && (
                    <div className="w-full flex-1 grid grid-cols-2 gap-6">
                      <textarea
                        value={activeNote.content}
                        onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                        className="w-full bg-[#0D0E13] p-4 rounded-xl border border-white/[0.06] text-xs font-mono text-zinc-200 resize-none focus:outline-none leading-relaxed"
                      />
                      <div className="w-full bg-[#0D0E13] p-4 rounded-xl border border-white/[0.06] overflow-y-auto markdown-body text-xs">
                        <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <p>No note selected. Click "+ New Note" to begin.</p>
            </div>
          )}
        </main>

        {/* ---------------------------------------------------------------------
            4. "ASK MIND" AI PANEL (Summarize Note + Contextual Chat grounded in notes)
           --------------------------------------------------------------------- */}
        <aside className="w-80 lg:w-96 bg-[#0E0F14] border-l border-white/[0.08] flex flex-col shrink-0 select-none">
          {/* AI Panel Header */}
          <div className="p-4 border-b border-white/[0.08] bg-[#12131A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-anton text-sm tracking-wider uppercase text-white">
                  Ask Mind AI
                </h3>
                <p className="text-[10px] font-mono text-zinc-400">
                  Google Gemini 2.5 Flash
                </p>
              </div>
            </div>

            {/* Summarize Action Button */}
            <button
              onClick={handleSummarizeNote}
              disabled={isAiLoading || !activeNote}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase font-mono tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Summarize</span>
            </button>
          </div>

          {/* AI Summary Card (if generated) */}
          {aiSummary && (
            <div className="p-3.5 m-3 rounded-xl bg-[#141620] border border-emerald-500/30 text-xs text-zinc-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-anton text-xs uppercase tracking-wider text-emerald-400">
                  Executive Summary
                </span>
                <button
                  onClick={() => setAiSummary("")}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  ×
                </button>
              </div>
              <div className="markdown-body text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Chat History Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-zinc-500">
                    <span>{isUser ? "You" : "Mind AI"}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? "bg-emerald-500 text-black font-medium"
                        : "bg-[#141620] text-zinc-200 border border-white/[0.08]"
                    }`}
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Citations pill */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.08] text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400">Sources: </span>
                        {msg.sources.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAiLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Mind AI is indexing workspace...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-white/[0.08] bg-[#12131A]">
            <form onSubmit={handleAskMind} className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about your notes..."
                className="w-full bg-[#161822] border border-white/[0.08] focus:border-emerald-500/60 rounded-lg pl-3 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiLoading}
                className="absolute right-1.5 p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[10px] font-mono text-zinc-500 mt-1.5 px-1 flex justify-between">
              <span>Enter to query notes</span>
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
