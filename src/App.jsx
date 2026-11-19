import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import AskMindDrawer from './components/layout/AskMindDrawer';
import WorkspaceCanvas from './components/workspace/WorkspaceCanvas';
import QuickIngestModal from './components/workspace/QuickIngestModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { notesService } from './services/notesService';
import { INITIAL_MOCK_NOTES } from './mock/mockNotes';

function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('mind_ai_notes_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MOCK_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id || null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(true);
  const [isQuickIngestOpen, setIsQuickIngestOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pinned' | 'code' | 'research'
  const [selectedTag, setSelectedTag] = useState(null);

  // Sync with Firestore in real-time if logged in and configured
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = notesService.subscribeToUserNotes(
        user.uid,
        (syncedNotes) => {
          if (syncedNotes && syncedNotes.length > 0) {
            setNotes(syncedNotes);
            if (!activeNoteId || !syncedNotes.some(n => n.id === activeNoteId)) {
              setActiveNoteId(syncedNotes[0]?.id);
            }
          }
        }
      );
      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Keyboard shortcut listener (⌘K / Ctrl+K, ⌘B / Ctrl+B, ⌘M / Ctrl+M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K: Open Quick Ingest Modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickIngestOpen(true);
      }
      // Cmd/Ctrl + B: Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      // Cmd/Ctrl + M: Toggle Ask Mind AI Drawer
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsAiDrawerOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute active note reference
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Aggregate all unique tags from notes
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    notes.forEach(note => {
      (note.tags || []).forEach(t => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [notes]);

  // Filter notes based on activeFilter, search query, and selectedTag
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title?.toLowerCase().includes(q);
        const matchesContent = note.content?.toLowerCase().includes(q);
        const matchesTags = note.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTags) return false;
      }

      // Tag filter
      if (selectedTag) {
        if (!note.tags || !note.tags.includes(selectedTag)) return false;
      }

      // Category filter
      if (activeFilter === 'pinned') return Boolean(note.pinned);
      if (activeFilter === 'code') return note.type === 'code';
      if (activeFilter === 'research') return note.type === 'research';

      return true;
    });
  }, [notes, searchQuery, selectedTag, activeFilter]);

  // CRUD Handlers
  const handleSaveNote = async (updatedNote) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
      localStorage.setItem('mind_ai_notes_cache', JSON.stringify(next));
      return next;
    });
    if (user?.uid) {
      await notesService.updateNote(updatedNote.id, updatedNote);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const nextNotes = notes.filter(n => n.id !== noteId);
    setNotes(nextNotes);
    localStorage.setItem('mind_ai_notes_cache', JSON.stringify(nextNotes));
    if (activeNoteId === noteId) {
      setActiveNoteId(nextNotes[0]?.id || null);
    }
    if (user?.uid) {
      await notesService.deleteNote(noteId);
    }
  };

  const handleTogglePin = async (noteId, currentPinned) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === noteId ? { ...n, pinned: !currentPinned } : n);
      localStorage.setItem('mind_ai_notes_cache', JSON.stringify(next));
      return next;
    });
    if (user?.uid) {
      await notesService.togglePin(noteId, currentPinned);
    }
  };

  const handleNewNote = async () => {
    const newNote = {
      id: 'note-' + Date.now(),
      title: 'Untitled Scratchpad',
      content: '# New Workspace Note\n\nStart typing or query with Mind AI...',
      type: 'note',
      tags: ['Scratchpad'],
      pinned: false,
      summary: 'Newly created workspace note.',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => {
      const next = [newNote, ...prev];
      localStorage.setItem('mind_ai_notes_cache', JSON.stringify(next));
      return next;
    });
    setActiveNoteId(newNote.id);

    if (user?.uid) {
      try {
        const saved = await notesService.addNote(user.uid, newNote);
        if (saved?.id) {
          setActiveNoteId(saved.id);
        }
      } catch (err) {
        console.error('Save to firestore error:', err);
      }
    }
  };

  const handleIngest = async (ingestedData) => {
    const newNote = {
      id: 'ingest-' + Date.now(),
      ...ingestedData,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => {
      const next = [newNote, ...prev];
      localStorage.setItem('mind_ai_notes_cache', JSON.stringify(next));
      return next;
    });
    setActiveNoteId(newNote.id);

    if (user?.uid) {
      await notesService.addNote(user.uid, newNote);
    }
  };

  const handleAskAI = (targetNote) => {
    setActiveNoteId(targetNote.id);
    setIsAiDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans antialiased overflow-hidden">
      {/* Top Header */}
      <Header
        onOpenQuickIngest={() => setIsQuickIngestOpen(true)}
        onNewNote={handleNewNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAiDrawerOpen={isAiDrawerOpen}
        setIsAiDrawerOpen={setIsAiDrawerOpen}
        notesCount={notes.length}
      />

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Navigation Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          allTags={allTags}
          notesCount={notes.length}
          pinnedCount={notes.filter(n => n.pinned).length}
          codeCount={notes.filter(n => n.type === 'code').length}
        />

        {/* Central Workspace Canvas */}
        <WorkspaceCanvas
          notes={filteredNotes}
          activeNote={activeNote}
          onSelectNote={(n) => setActiveNoteId(n.id)}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePin}
          onNewNote={handleNewNote}
          onAskAI={handleAskAI}
          activeFilter={activeFilter}
          selectedTag={selectedTag}
          onClearTag={() => setSelectedTag(null)}
        />

        {/* Right "Ask Mind" AI Contextual Drawer */}
        <AskMindDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          notes={notes}
          activeNote={activeNote}
          onSelectNote={(n) => setActiveNoteId(n.id)}
        />
      </div>

      {/* Instant Knowledge Ingest Modal (⌘K) */}
      <QuickIngestModal
        isOpen={isQuickIngestOpen}
        onClose={() => setIsQuickIngestOpen(false)}
        onIngest={handleIngest}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
