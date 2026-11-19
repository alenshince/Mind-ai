import React from 'react';
import { 
  Pin, 
  Code2, 
  BookOpen, 
  FileText, 
  Trash2, 
  Sparkles, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export default function NoteCard({
  note,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
  onAskAI
}) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'research':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div
      onClick={() => onSelect(note)}
      className={`group relative rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isActive
          ? 'bg-[#151c30] border-2 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
          : 'bg-[#0f1422] hover:bg-[#131a2c] border border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-white/[0.04]">
              {getTypeIcon(note.type)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {note.type || 'note'}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Ask AI shortcut */}
            <button
              onClick={() => onAskAI(note)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition-all"
              title="Ask AI about this note"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Pin Toggle */}
            <button
              onClick={() => onTogglePin(note.id, note.pinned)}
              className={`p-1 rounded transition-colors ${
                note.pinned 
                  ? 'text-cyan-400 hover:text-cyan-300' 
                  : 'text-slate-400 hover:text-slate-300 opacity-0 group-hover:opacity-100'
              }`}
              title={note.pinned ? "Unpin note" : "Pin note to top"}
            >
              <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-cyan-400' : ''}`} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDelete(note.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-white group-hover:text-cyan-200 transition-colors line-clamp-1 mb-1.5">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Summary or Preview snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {note.summary || note.content?.slice(0, 120) || 'Empty note content...'}
        </p>
      </div>

      {/* Bottom tags & time */}
      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
          {(note.tags || []).slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400"
            >
              #{tag}
            </span>
          ))}
          {(note.tags || []).length > 3 && (
            <span className="text-[10px] font-mono text-slate-400">
              +{note.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
          <Clock className="w-2.5 h-2.5" />
          <span>{formatTime(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
