import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Columns, 
  Maximize2, 
  Plus, 
  Sparkles, 
  Filter, 
  Search,
  FileCode,
  Tag
} from 'lucide-react';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';

export default function WorkspaceCanvas({
  notes = [],
  activeNote = null,
  onSelectNote = () => {},
  onSaveNote = () => {},
  onDeleteNote = () => {},
  onTogglePin = () => {},
  onNewNote = () => {},
  onAskAI = () => {},
  activeFilter = 'all',
  selectedTag = null,
  onClearTag = () => {},
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'editor'

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] flex flex-col bg-[#070a12] overflow-hidden">
      {/* Workspace Sub-Header Controls */}
      <div className="h-11 px-4 border-b border-white/[0.08] bg-[#0c101c] flex items-center justify-between text-xs select-none">
        {/* Left: Active Workspace Scope & Filter Info */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
            Workspace Canvas
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-400 capitalize">{activeFilter}</span>

          {selectedTag && (
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono text-[10px]">
              <Tag className="w-2.5 h-2.5" />
              <span>#{selectedTag}</span>
              <button onClick={onClearTag} className="hover:text-white ml-0.5">×</button>
            </div>
          )}

          <span className="text-[11px] font-mono text-slate-400 ml-1">
            ({notes.length} {notes.length === 1 ? 'item' : 'items'})
          </span>
        </div>

        {/* Right: View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-[#121828] p-0.5 rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'split' ? 'bg-[#1e2740] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View (List + Editor)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-[#1e2740] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View (All Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'editor' ? 'bg-[#1e2740] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Editor View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body based on viewMode */}
      <div className="flex-1 overflow-hidden flex">
        {/* Mode: GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="flex-1 overflow-y-auto p-5">
            {notes.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <FileCode className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">No notes found matching current filters.</p>
                <button
                  onClick={onNewNote}
                  className="mt-3 text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Create a new note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isActive={activeNote?.id === note.id}
                    onSelect={(n) => {
                      onSelectNote(n);
                      setViewMode('split');
                    }}
                    onTogglePin={onTogglePin}
                    onDelete={onDeleteNote}
                    onAskAI={onAskAI}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode: SPLIT VIEW (List on left, Editor on right) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Notes column */}
            <div className="w-80 md:w-96 border-r border-white/[0.08] bg-[#090d17] overflow-y-auto p-3 space-y-2.5">
              <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400">
                <span>Items ({notes.length})</span>
                <button
                  onClick={onNewNote}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onSelect={onSelectNote}
                  onTogglePin={onTogglePin}
                  onDelete={onDeleteNote}
                  onAskAI={onAskAI}
                />
              ))}

              {notes.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No notes match current criteria.
                </div>
              )}
            </div>

            {/* Note Editor column */}
            <div className="flex-1 p-4 bg-[#080b13] overflow-hidden">
              <NoteEditor
                note={activeNote}
                onSave={onSaveNote}
                onDelete={onDeleteNote}
                onAskAI={onAskAI}
              />
            </div>
          </div>
        )}

        {/* Mode: FULL EDITOR VIEW */}
        {viewMode === 'editor' && (
          <div className="flex-1 p-4 bg-[#080b13] overflow-hidden">
            <NoteEditor
              note={activeNote}
              onSave={onSaveNote}
              onDelete={onDeleteNote}
              onAskAI={onAskAI}
            />
          </div>
        )}
      </div>
    </div>
  );
}
