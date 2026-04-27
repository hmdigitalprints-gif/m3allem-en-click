import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepThink, setIsDeepThink] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Hello! I'm your M3allem En Click AI assistant. How can I help you today? You can describe a problem, and I'll suggest the right service!" }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      let response;
      if (isDeepThink) {
        response = await aiService.deepThink(userMsg, { history: chatHistory });
      } else {
        response = await aiService.chatWithAi(userMsg, chatHistory);
      }
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I'm having some trouble thinking right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-96 h-[550px] bg-[var(--bg)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--card-bg)]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-black">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">M3allem En Click AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsDeepThink(!isDeepThink)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 border ${
                    isDeepThink 
                      ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]' 
                      : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                  title="Toggle Deep Thinking Mode"
                >
                  <Sparkles size={14} className={isDeepThink ? 'animate-pulse' : ''} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Deep Think</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[var(--card-bg)] rounded-lg text-[var(--text-muted)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
              {chatHistory?.map((chat, i) => (
                <div 
                  key={i}
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      chat.role === 'user' ? 'bg-[var(--card-bg)]' : 'bg-[#FFD700]/10 text-[#FFD700]'
                    }`}>
                      {chat.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      chat.role === 'user' 
                        ? 'bg-[var(--card-bg)] text-[var(--text)] rounded-tr-none' 
                        : 'bg-[var(--card-bg)]/50 text-[var(--text)] border border-[var(--border)] rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 rounded-2xl bg-[var(--card-bg)]/50 text-[var(--text)] border border-[var(--border)] rounded-tl-none flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs italic opacity-50">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg)]/50">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full bg-[var(--card-bg)]/50 border border-[var(--border)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--text)] focus:outline-none focus:border-[#FFD700]/50 transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 p-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-center text-[var(--text-muted)]/50 mt-3 uppercase tracking-widest font-bold">
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-[var(--text)] text-[var(--bg)] rotate-90' : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[var(--bg)] animate-bounce" />
        )}
      </motion.button>
    </div>
  );
}
