import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, Zap } from 'lucide-react';
import Markdown from 'react-markdown';

export const ChatPanel = ({ chatHistory, setChatHistory, onSendMessage, loading, selectedModel, setSelectedModel }: any) => {
  const [message, setMessage] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!message.trim() || loading) return;
    onSendMessage(message);
    setMessage('');
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  return (
    <div className="border border-slate-700/60 bg-[#12151f]/90 rounded-3xl p-5 shadow-2xl flex flex-col h-full backdrop-blur-md justify-between">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80 mb-4 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">
              Consult Apex
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center gap-2">
            <span>Chat with your Performance AI</span>
          </p>
        </div>
        <div className="shrink-0">
          <select 
            value={selectedModel || 'gemini-3.5-flash'} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#090d14] border border-slate-700/80 text-teal-300 text-[10px] sm:text-xs rounded-lg px-2 py-1 outline-none focus:border-teal-500 transition-colors font-mono"
            disabled={loading}
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra Rápido)</option>
            
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans text-xs sm:text-sm custom-scrollbar min-h-[300px]">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-3 py-10">
            <div className="w-12 h-12 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-center justify-center text-teal-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-mono text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Performance OS Terminal
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Pregúntale a Apex sobre tu recuperación, zonas de potencia, cargas de boulder o ajustes semanales.
              </p>
            </div>
          </div>
        ) : (
          chatHistory.map((msg: any, i: number) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl p-4 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-[#1c2331] border border-slate-700/80 text-slate-100 rounded-tr-xs'
                    : 'bg-[#141d2a] border border-teal-900/40 text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-teal-400" />
                  )}
                  <span className={`text-[11px] uppercase tracking-wider font-mono font-bold ${
                    msg.role === 'user' ? 'text-slate-300' : 'text-teal-400'
                  }`}>
                    {msg.role === 'user' ? 'You' : 'Apex'}
                  </span>
                </div>
                <div className="markdown-body text-xs sm:text-sm leading-relaxed text-slate-200">
                  <Markdown>{msg.parts[0].text}</Markdown>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#141d2a] border border-teal-900/40 rounded-2xl p-4 flex items-center gap-3 shadow-md rounded-tl-xs text-xs font-mono text-teal-300">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>Apex procesando datos de telemetría...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Box */}
      <div className="pt-4 mt-3 border-t border-slate-800/80 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
            placeholder="Type your question here..."
            className="flex-1 bg-[#090d14] text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-teal-500 text-xs sm:text-sm transition-all"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-4 py-3 rounded-xl disabled:opacity-40 transition-colors shadow-lg active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
