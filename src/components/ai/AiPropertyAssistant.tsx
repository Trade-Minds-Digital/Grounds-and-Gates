import React, { useState, useRef, useEffect } from 'react';
import { Property, LanguageCode } from '../../types/property';
import { formatPriceINR } from '../../utils/propertyUtils';
import { api } from '../../services/api';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  MapPin,
  ArrowRight,
  Bot,
  User,
  RotateCcw
} from 'lucide-react';

interface AiPropertyAssistantProps {
  properties: Property[];
  lang: LanguageCode;
  onSelectProperty: (id: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  matchedProperties?: Property[];
  timestamp: string;
}

export const AiPropertyAssistant: React.FC<AiPropertyAssistantProps> = ({
  properties,
  lang,
  onSelectProperty,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-1',
    sender: 'assistant',
    text: lang === 'ta'
      ? 'வணக்கம்! நான் கிரவுண்ட்ஸ் அண்ட் கேட்ஸ் சொத்து வழிகாட்டி. உங்களுக்கு எந்த மாதிரியான மனை அல்லது வீடு தேவைப்படுகிறது?'
      : 'Hello! I am your Grounds & Gates Property Assistant. How can I help you find your dream plot, villa, or farmland across Tamil Nadu today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    {
      label: 'Villa plots in Coimbatore < ₹50L',
      query: 'villa plot in coimbatore under 50 lakhs'
    },
    {
      label: 'ECR Beachside Villas in Chennai',
      query: 'beachside villa in ecr chennai'
    },
    {
      label: 'Agricultural Land in Pollachi',
      query: 'agricultural coconut grove in pollachi'
    },
    {
      label: '2BHK / 3BHK IT Corridor Flats',
      query: 'apartments in it corridor'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Try backend AI proxy first
    try {
      const aiResponse = await api.askAiAssistant(text, lang);
      if (aiResponse && aiResponse.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: aiResponse.reply,
          matchedProperties: (aiResponse.matchedProperties && aiResponse.matchedProperties.length > 0)
            ? (aiResponse.matchedProperties as unknown as Property[])
            : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Backend not running, proceed to client-side heuristic matching
    }

    // Simulated Smart Local Matching against loaded properties
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched: Property[] = [];

      // Check District Matches
      const districts = ['coimbatore', 'chennai', 'madurai', 'tiruppur', 'erode', 'salem', 'trichy', 'pollachi', 'ooty', 'hosur'];
      const matchedDistrict = districts.find(d => lower.includes(d));

      // Check Category Matches
      const isVillaPlot = lower.includes('villa plot') || (lower.includes('villa') && lower.includes('plot'));
      const isPlot = !isVillaPlot && (lower.includes('plot') || lower.includes('land') || lower.includes('மனை'));
      const isVilla = !isVillaPlot && (lower.includes('villa') || lower.includes('வில்லா'));
      const isHouse = lower.includes('house') || lower.includes('home') || lower.includes('வீடு');
      const isAgri = lower.includes('agri') || lower.includes('farm') || lower.includes('தோட்டம்') || lower.includes('coconut');
      const isFlat = lower.includes('apartment') || lower.includes('flat') || lower.includes('bhk');
      const isCommercial = lower.includes('commercial') || lower.includes('showroom') || lower.includes('office');

      // Price filter heuristics
      const under50L = lower.includes('50 lakh') || lower.includes('50l') || lower.includes('under 50') || lower.includes('50 lakhs');
      const under1Cr = lower.includes('1 cr') || lower.includes('crore') || lower.includes('1cr');

      matched = properties.filter(p => {
        let score = true;
        if (matchedDistrict && p.district.toLowerCase() !== matchedDistrict) {
          score = false;
        }
        if (isVillaPlot && !(p.category === 'residential-plots' || p.category === 'villas')) score = false;
        if (isPlot && p.category !== 'residential-plots') score = false;
        if (isVilla && p.category !== 'villas') score = false;
        if (isHouse && p.category !== 'independent-houses') score = false;
        if (isAgri && p.category !== 'agricultural-land') score = false;
        if (isFlat && p.category !== 'apartments') score = false;
        if (isCommercial && p.category !== 'commercial-properties') score = false;

        if (under50L && p.price > 5000000) score = false;
        if (under1Cr && p.price > 10000000) score = false;

        return score;
      });

      // Flexible word matching fallback if strict heuristics yield 0
      if (matched.length === 0) {
        const stopWords = ['the', 'and', 'for', 'with', 'in', 'under', 'lakhs', 'lakh', 'crores', 'crore'];
        const words = lower.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
        matched = properties.filter(p => {
          const haystack = `${p.title} ${p.district} ${p.location} ${p.category} ${(p.amenities || []).join(' ')}`.toLowerCase();
          return words.length > 0 && words.some(w => haystack.includes(w));
        });
      }

      const results = matched.slice(0, 3);

      let replyText = '';
      if (results.length > 0) {
        replyText = lang === 'ta'
          ? `உங்கள் தேடலுக்கு ஏற்ற ${results.length} சிறந்த சொத்துக்களை நான் கண்டறிந்துள்ளேன். கீழே விவரங்களைக் காணலாம்:`
          : `I found ${results.length} matching properties fitting your criteria in our Tamil Nadu catalog:`;
      } else {
        replyText = lang === 'ta'
          ? 'மன்னிக்கவும், உங்கள் குறிப்பிட்ட தேடலுக்கு நேரடி முடிவுகள் கிடைக்கவில்லை. கோயம்புத்தூர் அல்லது சென்னை மனைகளைத் தேட பரிந்துரைக்கிறேன்.'
          : `I couldn't find an exact match for "${text}". Try asking for "Plots in Coimbatore under ₹50L" or "Villas in ECR Chennai".`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        matchedProperties: results.length > 0 ? results : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#013E18] text-[#F5F2E9] shadow-2xl border-2 border-[#C99325] hover:bg-[#00280f] hover:scale-105 transition-all duration-300 cursor-pointer"
          aria-label="Open AI Property Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#C99325]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C99325] animate-ping" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            Smart Match AI (Demo)
          </span>
        </button>
      </div>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] h-[540px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="px-5 py-4 bg-[#013E18] text-[#F5F2E9] flex items-center justify-between border-b border-[#C99325]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C99325]/20 text-[#C99325] flex items-center justify-center shrink-0 border border-[#C99325]/40">
                <Sparkles className="w-4 h-4 text-[#C99325]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">
                    Grounds & Gates Smart Match
                  </h3>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#C99325] text-white">
                    Demo
                  </span>
                </div>
                <p className="text-[10px] text-stone-300">
                  Natural language property discovery assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#013E18] text-[#C99325] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#013E18] text-white rounded-br-none'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Embedded Matching Property Cards */}
                  {msg.matchedProperties && msg.matchedProperties.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-stone-100">
                      {msg.matchedProperties.map(prop => (
                        <div
                          key={prop.id}
                          onClick={() => {
                            onSelectProperty(prop.id);
                            setIsOpen(false);
                          }}
                          className="group p-2 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-white hover:border-[#013E18]/40 hover:shadow-xs transition-all cursor-pointer flex gap-2.5 items-center"
                        >
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-[#C99325] uppercase tracking-wider block truncate">
                              {prop.category.replace('-', ' ')}
                            </span>
                            <div className="font-bold text-[#18241B] truncate text-[11px] group-hover:text-[#013E18]">
                              {prop.title}
                            </div>
                            <div className="flex items-center justify-between text-[10px] mt-0.5">
                              <span className="font-extrabold text-[#013E18]">
                                {formatPriceINR(prop.price)}
                              </span>
                              <span className="text-stone-400 truncate">
                                {prop.location}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C99325] shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] opacity-60 block text-right mt-1.5">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-stone-400">
                <div className="w-6 h-6 rounded-full bg-[#013E18] text-[#C99325] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl px-3 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C99325] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#013E18] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C99325] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <span className="text-[10px] text-stone-400 font-semibold uppercase shrink-0">
              Suggestions:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#F5F2E9] hover:text-[#013E18] text-stone-600 font-medium text-[10px] whitespace-nowrap transition-colors border border-stone-200/60 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={lang === 'ta' ? 'எ.கா: கோவையில் 50 லட்சத்திற்குள் மனை...' : 'e.g., Plots in Coimbatore under 50 Lakhs...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:border-[#013E18] focus:bg-white outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#013E18] text-[#F5F2E9] disabled:opacity-40 hover:bg-[#00280f] transition-all cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-[#C99325]" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
