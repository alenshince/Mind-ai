import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { geminiService } from '../../services/geminiService';

export default function AskMindDrawer({
  isOpen,
  onClose,
  notes = [],
  activeNote = null,
  onSelectNote = () => {},
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      text: `Hello! I'm **Mind AI**, your workspace intelligence copilot. I've indexed **${notes.length} notes** in your active canvas.
      
Ask me any technical question, request architecture synthesis, or generate code explanations directly from your workspace context.`,
      sources: [],
      timestamp: 'Just now',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await geminiService.queryWorkspace({
        query: promptToSend,
        notes,
        activeNote,
      });

      const aiMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        text: response.text,
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: response.model,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          text: `⚠️ Query processing error: ${err.message}`,
          sources: [],
          timestamp: 'Just now',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: 'Summarize Active Note', action: () => handleSend(`Summarize the active note "${activeNote?.title || 'current context'}" with key takeaways`) },
    { label: 'Explain Firestore Pattern', action: () => handleSend('Explain the Firestore real-time listener implementation and best practices') },
    { label: 'Synthesize Architecture', action: () => handleSend('Provide a technical architecture synthesis of our hybrid AI system') },
  ];

  if (!isOpen) return null;

  return (
    <div className="w-96 md:w-[420px] h-[calc(100vh-3.5rem)] bg-[#0c111e] border-l border-white/[0.08] flex flex-col z-20 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0f1527] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-white">Ask Mind AI</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{notes.length} notes in context</span>
              {activeNote && (
                <>
                  <span>•</span>
                  <span className="text-cyan-400 truncate max-w-[120px]">Focus: {activeNote.title}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-b border-white/[0.05] bg-[#0a0e19] overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={qp.action}
            disabled={loading}
            className="whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-medium bg-[#131a2c] hover:bg-purple-950/40 text-slate-300 hover:text-purple-300 border border-white/[0.06] hover:border-purple-600/40 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-mono">
                {isUser ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="text-purple-400 font-medium">Mind AI</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div 
                className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                    : 'bg-[#141b2e] text-slate-200 border border-white/[0.08]'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Citations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.08]">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Cited Notes:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((srcTitle, idx) => {
                        const targetNote = notes.find(n => n.title.toLowerCase() === srcTitle.toLowerCase());
                        return (
                          <button
                            key={idx}
                            onClick={() => targetNote && onSelectNote(targetNote)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono transition-colors"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[150px]">{srcTitle}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isUser && (
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[11px] text-purple-400 font-mono">Mind AI is thinking...</span>
            <div className="bg-[#141b2e] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-mono ml-2">Synthesizing workspace context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0e1424]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes, code, or architecture..."
            className="w-full bg-[#161d31] border border-white/[0.08] focus:border-purple-500/60 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:hover:bg-purple-600 transition-colors"
            title="Send (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1">
          <span>Enter to send</span>
          <span>Google × Firebase Hybrid AI</span>
        </div>
      </div>
    </div>
  );
}
