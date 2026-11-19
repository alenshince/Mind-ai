import React from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Database, 
  CloudCheck, 
  Zap, 
  PanelRightOpen, 
  PanelRightClose,
  Code2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ 
  onOpenQuickIngest, 
  onNewNote,
  searchQuery, 
  setSearchQuery,
  isAiDrawerOpen, 
  setIsAiDrawerOpen,
  notesCount = 0
}) {
  const { user, isFirebaseConfigured, loginWithGoogle, logout } = useAuth();

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#0c101c]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Hackathon Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight text-sm">Mind AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-medium">
                v0.1-alpha
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-white/[0.08] text-xs text-slate-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[11px] text-slate-300">Google × Firebase #BuildHybridAI</span>
        </div>
      </div>

      {/* Global Search & Command Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <div 
          onClick={onOpenQuickIngest}
          className="group relative flex items-center w-full bg-[#131929] hover:bg-[#182035] border border-white/[0.08] hover:border-cyan-500/40 rounded-lg px-3 py-1.5 text-xs text-slate-400 cursor-pointer transition-all duration-200"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="flex-1 truncate">Instant Ingest or search workspace notes...</span>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#0c101c] text-slate-400 border border-white/[0.1] rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Action Controls & AI Drawer Trigger */}
      <div className="flex items-center gap-2.5">
        {/* Quick Ingest Button */}
        <button
          onClick={onOpenQuickIngest}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#141b2d] hover:bg-[#1a233b] border border-white/[0.08] text-slate-200 hover:text-white transition-colors"
          title="Quickly add note or snippet (⌘K)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Ingest</span>
        </button>

        {/* New Note Button */}
        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>

        {/* Ask Mind AI Panel Toggle */}
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            isAiDrawerOpen 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20' 
              : 'bg-[#141b2d] hover:bg-[#1d263f] text-slate-300 border border-white/[0.08]'
          }`}
          title="Toggle 'Ask Mind' AI Copilot"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiDrawerOpen ? 'text-purple-400 animate-spin-slow' : 'text-purple-400'}`} />
          <span className="hidden sm:inline">Ask Mind</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        </button>

        {/* User / Sync Status Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <div 
            title={isFirebaseConfigured ? "Connected to Cloud Firestore" : "Running in Local Offline/Demo mode"}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-[#101625] border border-white/[0.06] text-slate-300"
          >
            <Database className={`w-3 h-3 ${isFirebaseConfigured ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className="hidden md:inline">{isFirebaseConfigured ? 'Firestore' : 'Local Mock'}</span>
          </div>

          {user ? (
            <div 
              onClick={() => logout()}
              className="flex items-center gap-2 cursor-pointer group"
              title={`Logged in as ${user.displayName || user.email} (Click to sign out)`}
            >
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email || 'mind'}`}
                alt="Avatar" 
                className="w-7 h-7 rounded-full border border-indigo-500/40 group-hover:border-indigo-400 transition-colors"
              />
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="text-xs px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
