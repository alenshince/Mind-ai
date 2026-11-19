import React from 'react';
import { 
  FolderKanban, 
  Pin, 
  Code2, 
  BookOpen, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Hash,
  Sparkles,
  Terminal
} from 'lucide-react';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeFilter,
  setActiveFilter,
  selectedTag,
  setSelectedTag,
  allTags = [],
  notesCount = 0,
  pinnedCount = 0,
  codeCount = 0
}) {
  const navItems = [
    { id: 'all', label: 'All Workspace Items', icon: FolderKanban, count: notesCount },
    { id: 'pinned', label: 'Pinned Priority', icon: Pin, count: pinnedCount },
    { id: 'code', label: 'Code & Snippets', icon: Code2, count: codeCount },
    { id: 'research', label: 'Research & Blueprints', icon: BookOpen, count: notesCount - codeCount },
  ];

  return (
    <aside 
      className={`h-[calc(100vh-3.5rem)] bg-[#0a0e18] border-r border-white/[0.08] flex flex-col transition-all duration-300 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Filter Links */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id && !selectedTag;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveFilter(item.id);
                setSelectedTag(null);
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 text-cyan-300 border border-cyan-800/50 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-cyan-900/40 text-cyan-200' : 'bg-white/[0.05] text-slate-500'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-white/[0.06] mx-3 my-1" />

      {/* Tags Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-slate-400" />
                Indexed Tags
              </span>
              {selectedTag && (
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-[11px] font-mono px-2 py-0.8 rounded-md transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                        : 'bg-[#121827] text-slate-400 hover:text-slate-200 hover:bg-[#1a2237] border border-white/[0.05]'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            <Tag className="w-4 h-4 text-slate-400" title="Tags Index" />
          </div>
        )}
      </div>

      {/* Active AI Context Pill / Status */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-lg bg-gradient-to-b from-[#101728] to-[#0c111e] border border-white/[0.08] shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1 text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Gemini Flash
            </span>
            <span className="text-[10px] text-emerald-400">Ready</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Active workspace memory packed for contextual queries.
          </div>
        </div>
      )}

      {/* Collapse / Expand Control */}
      <div className="p-3 border-t border-white/[0.08] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Dev Console</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors ml-auto"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
