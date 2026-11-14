import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Minus,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { aiApi, AiChatMessage } from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const STORAGE_KEY = 'genie_ai_chat_history_v1';
const POPUP_SEEN_KEY = 'genie_ai_prompt_seen';

const SUGGESTED_QUESTIONS = [
  '📱 How do I sell my phone?',
  '💰 When and how do I get paid?',
  '🚚 Is doorstep pickup free in Tamil Nadu?',
  '🔍 Where do I track my order?',
  '⭐ Browse certified refurbished phones',
];

export const GenieAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location: userLoc } = useUserLocation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history or set initial greeting
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    const greeting: DisplayMessage = {
      id: 'welcome',
      role: 'assistant',
      content:
        `**Vanakkam!** 🙏 I'm your **Genie AI Guide** ✨\n\n` +
        `I can help you get the **highest value for your old phone**, guide you through **free doorstep pickup in Tamil Nadu**, explain our **instant handover payout**, or **track your request**.\n\n` +
        `How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greeting]);
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: DisplayMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiPayload: AiChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = {
        currentPath: location.pathname + location.search,
        cityName: userLoc?.city || 'Tamil Nadu',
      };

      const reply = await aiApi.sendMessage(apiPayload, contextData);

      const aiMsg: DisplayMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: DisplayMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          `I couldn't reach the server right now, but you can still explore:\n\n` +
          `• [Sell Your Device](/sell?category=phone)\n` +
          `• [Track Your Request](/track)\n` +
          `• [Browse Certified Phones](/buy)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const greeting: DisplayMessage = {
      id: 'welcome-reset',
      role: 'assistant',
      content:
        `Chat history cleared! ✨ I'm ready to help you sell your phone, check prices, or guide you around Genie. What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greeting]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Custom Markdown Renderer:
   * Renders bold text, bullet points, numbered lists, and interactive clickable links!
   */
  const renderFormattedContent = (content: string) => {
    // Split into paragraphs/lines
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Header line
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 dark:text-white pt-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Bullet item
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.replace(/^[•\-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <span>{renderInlineSegments(itemText)}</span>
              </div>
            );
          }

          // Numbered item
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="font-bold text-violet-600 dark:text-violet-400 shrink-0 text-xs mt-0.5">
                  {numMatch[1]}.
                </span>
                <span>{renderInlineSegments(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineSegments(trimmed)}</p>;
        })}
      </div>
    );
  };

  /**
   * Parses bold `**text**` and markdown links `[Label](/path)` into clickable elements.
   */
  const renderInlineSegments = (text: string) => {
    // Regex for [Label](path) and **bold**
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        parts.push(renderBoldSegments(textBefore, `tb-${lastIndex}`));
      }

      const label = match[1];
      const targetUrl = match[2];
      const isInternal = targetUrl.startsWith('/');

      parts.push(
        <button
          key={`link-${matchIndex}`}
          type="button"
          onClick={() => {
            if (isInternal) {
              navigate(targetUrl);
            } else {
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          className="inline-flex items-center gap-1 my-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 hover:bg-violet-200 text-violet-900 border border-violet-200 dark:bg-violet-950/70 dark:hover:bg-violet-900 dark:text-violet-200 dark:border-violet-800 transition-all hover:scale-102 active:scale-98 shadow-sm cursor-pointer"
        >
          <span>{label}</span>
          <ArrowRight className="w-3 h-3 text-amber-500" />
        </button>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderBoldSegments(text.substring(lastIndex), `ta-${lastIndex}`));
    }

    return parts;
  };

  const renderBoldSegments = (text: string, keyPrefix: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const segments: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = boldRegex.exec(text)) !== null) {
      const matchIdx = match.index;
      if (matchIdx > lastIdx) {
        segments.push(text.substring(lastIdx, matchIdx));
      }
      segments.push(
        <strong key={`${keyPrefix}-b-${matchIdx}`} className="font-semibold text-slate-900 dark:text-white">
          {match[1]}
        </strong>
      );
      lastIdx = boldRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      segments.push(text.substring(lastIdx));
    }

    return <React.Fragment key={keyPrefix}>{segments}</React.Fragment>;
  };

  return (
    <>
      {/* Floating Right Corner Trigger */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="group flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white dark:bg-[#15102a] text-slate-800 dark:text-white border border-slate-200/90 dark:border-violet-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
          >
            <img
              src="/genie_symbol.png"
              alt="Genie"
              className="h-8 w-8 object-contain transition-transform group-hover:scale-110"
            />
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Assistant
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] rounded-3xl shadow-[0_20px_60px_-15px_rgba(20,10,45,0.45)] border border-violet-200/80 dark:border-violet-900/60 bg-white dark:bg-[#0c0918] flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#170e33] via-[#26144e] to-[#120a28] text-white border-b border-violet-900/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-300/50 p-1 shadow-inner">
                <img src="/genie_symbol.png" alt="Genie" className="h-full w-full object-contain" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#170e33]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Genie AI Guide
                  <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-400/30">
                    Groq Fast
                  </span>
                </h3>
                <p className="text-[10px] text-violet-200/80 flex items-center gap-1">
                  <span>Tamil Nadu Buyback & Delivery</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Restart chat"
                className="p-1.5 rounded-xl text-violet-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="p-1.5 rounded-xl text-violet-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close assistant"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-[#0c0918]">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 p-1 mb-1">
                      <img src="/genie_symbol.png" alt="Genie" className="h-full w-full object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-900 to-[#1f1042] text-white rounded-br-none border border-violet-800/50'
                        : 'bg-white dark:bg-[#16122a] text-slate-800 dark:text-neutral-100 rounded-bl-none border border-slate-200/70 dark:border-violet-950'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      renderFormattedContent(m.content)
                    )}
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? 'text-violet-300/80' : 'text-slate-400 dark:text-neutral-500'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 p-1">
                  <img src="/genie_symbol.png" alt="Genie" className="h-full w-full object-contain" />
                </div>
                <div className="rounded-2xl rounded-bl-none bg-white dark:bg-[#16122a] border border-slate-200 dark:border-violet-950 px-4 py-2.5 shadow-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                  <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-medium ml-1">
                    Genie is thinking…
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 pt-2 pb-1.5 border-t border-slate-200/60 dark:border-violet-950/60 bg-white/70 dark:bg-[#0f0c20]/70 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-900 border border-slate-200 dark:bg-[#18132e] dark:hover:bg-violet-900/60 dark:text-neutral-300 dark:hover:text-white dark:border-violet-900/50 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#0c0918] border-t border-slate-200 dark:border-violet-950/70 shrink-0"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about selling, tracking, or pricing…"
                disabled={isLoading}
                className="w-full h-11 pl-3.5 pr-12 rounded-2xl border border-slate-200 bg-slate-50 text-[13px] text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-300/30 dark:border-violet-950 dark:bg-[#15102a] dark:text-white dark:focus:border-amber-400/80"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 to-amber-500 text-white shadow-sm transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500 px-1">
              <span>Powered by Groq AI</span>
              <span>Tamil Nadu Instant Buyback</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
