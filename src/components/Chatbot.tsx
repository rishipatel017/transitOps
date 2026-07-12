import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Activity, Loader2 } from 'lucide-react';
import { chatWithAI } from '../utils/ai';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface ChatbotProps {
  appState?: any;
}

export const Chatbot: React.FC<ChatbotProps> = ({ appState }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello I am your assistant, your TransitOps AI Assistant. 🚚 How can I help you manage your fleet, drivers, and operations today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userMessageText,
      time: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })) as {role: 'user'|'model', text: string}[];
      
      const systemPrompt = `You are Antigravity, the AI Copilot for TransitOps. You are an expert in fleet management logistics.
Here is the live JSON snapshot of the fleet's current state (do not expose this JSON raw to the user, just use it to answer their questions accurately):
${JSON.stringify(appState, null, 2)}
Keep answers concise, professional, and directly address the user's data when relevant.`;

      const botResponseText = await chatWithAI(systemPrompt, history, userMessageText);

      const botMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting to my AI brain right now. Please make sure the Gemini API key is valid.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]" id="transitops-chatbot">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[460px] rounded-2xl border border-brand-outline shadow-2xl flex flex-col overflow-hidden backdrop-blur-md mb-4"
            style={{ background: 'rgba(18, 18, 30, 0.96)' }}
            id="chatbot-window"
          >
            {/* Header */}
            <div className="p-4 bg-brand-surface-low border-b border-brand-outline flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                  <Activity className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">Antigravity Copilot</h4>
                  <span className="text-[9px] font-mono text-brand-primary uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span> Online Assistant
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
                id="chatbot-close-btn"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-brand-primary text-black font-semibold rounded-tr-none'
                        : 'bg-brand-surface border border-brand-outline/80 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-brand-surface border border-brand-outline text-brand-secondary rounded-2xl rounded-tl-sm px-4 py-2 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span className="text-xs font-mono">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-brand-outline bg-[#020b14]/50 flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me 'how are you' or 'contact info'..."
                className="flex-1 bg-brand-surface border border-brand-outline text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-brand-primary"
                id="chatbot-input"
              />
              <button 
                type="submit"
                className="h-8.5 w-8.5 bg-brand-primary hover:bg-white text-black rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer"
                id="chatbot-submit"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-brand-primary text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all shadow-brand-primary/10 cursor-pointer"
        id="chatbot-toggle-btn"
        aria-label="Open support chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};
