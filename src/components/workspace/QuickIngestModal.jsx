import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  X, 
  Code2, 
  BookOpen, 
  FileText, 
  Plus, 
  Sparkles,
  ArrowRight,
  Hash
} from 'lucide-react';

export default function QuickIngestModal({
  isOpen,
  onClose,
  onIngest,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('note'); // 'note' | 'code' | 'research'
  const [tags, setTags] = useState(['QuickIngest']);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onIngest({
      title: title.trim() || 'Quick Ingest Note',
      content: content.trim(),
      type,
      tags,
      pinned: false,
    });

    setTitle('');
    setContent('');
    setTags(['QuickIngest']);
    onClose();
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter(tag => tag !== t));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-[#0f1526] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#131b30] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Instant Knowledge Ingest</h2>
              <p className="text-[11px] text-slate-400">Instantly save & index notes, code, or documentation into Mind AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Note Type Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Ingest Type:</span>
            <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setType('note')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  type === 'note' ? 'bg-[#182136] text-amber-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
              <button
                type="button"
                onClick={() => setType('code')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  type === 'code' ? 'bg-[#182136] text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Snippet</span>
              </button>
              <button
                type="button"
                onClick={() => setType('research')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  type === 'research' ? 'bg-[#182136] text-indigo-300 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Research / Spec</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title or Reference Identifier..."
              className="w-full bg-[#151c31] border border-white/[0.08] focus:border-cyan-500/60 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Content / Paste Area */}
          <div>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'code'
                  ? 'Paste code snippet or terminal command here...'
                  : 'Paste research text, notes, prompt requirements, or documentation here...'
              }
              className={`w-full bg-[#151c31] border border-white/[0.08] focus:border-cyan-500/60 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed ${
                type === 'code' ? 'font-mono text-cyan-100' : 'font-sans'
              }`}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Tags:
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400 ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e);
                  }
                }}
                placeholder="+ tag & Enter"
                className="bg-transparent text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none w-24 px-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <div className="text-[11px] text-slate-400 font-mono">
              Auto-syncs with Cloud Firestore & indexes for Gemini
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() && !content.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40"
              >
                <span>Ingest & Index</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
