import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Sparkles, 
  Pin, 
  Trash2, 
  Copy, 
  Check, 
  Code2, 
  BookOpen, 
  FileText, 
  Tag as TagIcon,
  X,
  Plus,
  Zap
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export default function NoteEditor({
  note,
  onSave,
  onDelete,
  onAskAI,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('note');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setType(note.type || 'note');
      setLanguage(note.language || 'javascript');
      setTags(note.tags || []);
      setIsPinned(Boolean(note.pinned));
      setSaveStatus('saved');
    }
  }, [note?.id]);

  const triggerSave = (newUpdates = {}) => {
    if (!note) return;
    setSaveStatus('saving');
    const updatedNote = {
      ...note,
      title,
      content,
      type,
      language,
      tags,
      pinned: isPinned,
      ...newUpdates,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedNote);
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    setSaveStatus('dirty');
  };

  const handleContentChange = (val) => {
    setContent(val);
    setSaveStatus('dirty');
  };

  const handleAddTag = (e) => {
    e?.preventDefault();
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      const nextTags = [...tags, cleanTag];
      setTags(nextTags);
      triggerSave({ tags: nextTags });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = tags.filter(t => t !== tagToRemove);
    setTags(nextTags);
    triggerSave({ tags: nextTags });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (!content.trim() || isAiSummarizing) return;
    setIsAiSummarizing(true);
    try {
      const summaryText = await geminiService.summarize(content, title);
      const updatedContent = `${content}\n\n---\n${summaryText}`;
      setContent(updatedContent);
      triggerSave({ content: updatedContent, summary: summaryText.slice(0, 160) });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSummarizing(false);
    }
  };

  const handleExplainCode = async () => {
    if (!content.trim() || isAiSummarizing) return;
    setIsAiSummarizing(true);
    try {
      const explanation = await geminiService.explainCode(content, language);
      const updatedContent = `${content}\n\n/* --- AI Code Explanation ---\n${explanation}\n*/`;
      setContent(updatedContent);
      triggerSave({ content: updatedContent });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSummarizing(false);
    }
  };

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <FileText className="w-12 h-12 stroke-[1.2] mb-3 text-slate-600" />
        <h3 className="text-base font-medium text-slate-300 mb-1">No Note Selected</h3>
        <p className="text-xs max-w-sm text-slate-500">
          Select an item from the canvas grid or create a new note to start drafting and querying with Mind AI.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
      {/* Top action bar */}
      <div className="p-3 bg-[#0f1422] border-b border-white/[0.08] flex items-center justify-between gap-3">
        {/* Type selector */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => { setType('note'); triggerSave({ type: 'note' }); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              type === 'note' ? 'bg-[#182136] text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
          <button
            onClick={() => { setType('code'); triggerSave({ type: 'code' }); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              type === 'code' ? 'bg-[#182136] text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            onClick={() => { setType('research'); triggerSave({ type: 'research' }); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              type === 'research' ? 'bg-[#182136] text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research</span>
          </button>
        </div>

        {/* Code language picker if code */}
        {type === 'code' && (
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              triggerSave({ language: e.target.value });
            }}
            className="bg-[#121827] text-cyan-400 border border-white/[0.08] rounded-md px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="bash">Bash / Shell</option>
          </select>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Ask AI Context */}
          <button
            onClick={() => onAskAI(note)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-colors"
            title="Open in Ask Mind AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Ask Mind</span>
          </button>

          {/* AI Summarize / Code explain action */}
          {type === 'code' ? (
            <button
              onClick={handleExplainCode}
              disabled={isAiSummarizing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#141b2e] hover:bg-[#1a233c] text-cyan-300 border border-cyan-800/50 transition-colors disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAiSummarizing ? 'Analyzing...' : 'Explain Code'}</span>
            </button>
          ) : (
            <button
              onClick={handleSummarize}
              disabled={isAiSummarizing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#141b2e] hover:bg-[#1a233c] text-slate-300 hover:text-white border border-white/[0.08] transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAiSummarizing ? 'Summarizing...' : 'Summarize'}</span>
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Pin toggle */}
          <button
            onClick={() => {
              const next = !isPinned;
              setIsPinned(next);
              triggerSave({ pinned: next });
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isPinned ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isPinned ? "Unpin note" : "Pin note"}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-cyan-400' : ''}`} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Explicit Save */}
          <button
            onClick={() => triggerSave()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveStatus === 'saving' ? 'Syncing...' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => triggerSave()}
          placeholder="Untitled Note..."
          className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 focus:outline-none tracking-tight"
        />

        {/* Tags bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <TagIcon className="w-3 h-3 text-slate-400 mr-1" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#13192a] text-cyan-300 border border-cyan-800/40"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400 transition-colors ml-0.5"
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
              className="bg-transparent text-[11px] font-mono text-slate-400 placeholder-slate-600 focus:outline-none focus:text-cyan-300 w-20 px-1"
            />
          </form>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[300px] flex flex-col pt-2 border-t border-white/[0.05]">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={() => triggerSave()}
            placeholder={
              type === 'code'
                ? `// Write or paste ${language} code here...\n// Gemini AI will automatically index variables, classes, and logic flow.`
                : '# Write markdown, technical requirements, or research documentation...\nUse Ctrl+K to ingest external references.'
            }
            className={`w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed ${
              type === 'code' ? 'font-mono text-xs text-cyan-100 bg-[#080c14] p-3 rounded-lg border border-white/[0.04]' : 'text-sm font-sans'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
