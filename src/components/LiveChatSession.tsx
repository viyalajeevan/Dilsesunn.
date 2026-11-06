import React, { useState, useEffect, useRef } from 'react';
import { AnonymousUser } from '../types';
import { ActiveSession, RealtimeMessage } from '../types/peerSupport';
import { backendSocket } from '../services/backendSocket';
import {
  X,
  PhoneCall,
  Send,
  Heart,
  Shield,
  MoreVertical,
  Flag,
  LifeBuoy,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveChatSessionProps {
  user: AnonymousUser;
  session: ActiveSession;
  peer: {
    userId: string;
    uniqueTag: string;
    alias: string;
    auraColor: string;
  };
  role: 'requester' | 'listener';
  onEndSession: () => void;
  onSwitchToCall: () => void;
  onOpenCrisis: () => void;
}

const CRISIS_TRIGGERS = [
  'suicide',
  'kill myself',
  'end my life',
  'harm myself',
  'want to die',
  'overdose',
  'cutting myself'
];

export const LiveChatSession: React.FC<LiveChatSessionProps> = ({
  user,
  session,
  peer,
  role,
  onEndSession,
  onSwitchToCall,
  onOpenCrisis
}) => {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Subscribe to real-time events from backend
  useEffect(() => {
    const unsubscribe = backendSocket.subscribe((event) => {
      if (event.type === 'CHAT_MESSAGE_DELIVERED') {
        const msg: RealtimeMessage = event.payload;
        setMessages((prev) => {
          // prevent duplicates
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Check for crisis trigger words
        const lower = msg.text.toLowerCase();
        if (CRISIS_TRIGGERS.some((t) => lower.includes(t))) {
          setShowCrisisAlert(true);
        }
      } else if (event.type === 'PEER_TYPING') {
        setIsPeerTyping(event.payload.isTyping);
      } else if (event.type === 'SESSION_ENDED' || event.type === 'SESSION_TERMINATED_SAFETY') {
        onEndSession();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onEndSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    backendSocket.sendTyping(true);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      backendSocket.sendTyping(false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    backendSocket.sendChatMessage(inputText.trim());
    backendSocket.sendTyping(false);
    setInputText('');
  };

  const handleSendPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const handleSendHug = (e: React.MouseEvent) => {
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 22,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        },
        colors: ['#f43f5e', '#6366f1', '#10b981']
      });
    } catch (err) {
      // ignore
    }
    backendSocket.sendChatMessage(`🫂 [Sent an anonymous warm hug]`);
  };

  const handleReportAndBlock = (reason: string) => {
    backendSocket.reportAndBlock(peer.userId, reason);
    setReportReason(reason);
    setTimeout(() => {
      onEndSession();
    }, 1200);
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isListener = role === 'listener';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[90vh] max-h-[780px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: peer.auraColor }}
            >
              {peer.alias.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{peer.alias}</span>
                <span className="font-mono text-xs text-slate-500">{peer.uniqueTag}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="capitalize font-medium text-slate-700">
                  {session.topic.replace(/_/g, ' ')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600">
                  {isListener ? 'Offering listening shoulder' : 'Seeking a shoulder'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Switch to Voice Call */}
            <button
              onClick={onSwitchToCall}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              title="Elevate to genuine audio voice call"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Call</span>
            </button>

            {/* Hug button */}
            <button
              onClick={handleSendHug}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              title="Send an anonymous warm hug"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span className="hidden sm:inline">Send Hug</span>
            </button>

            {/* Safety & Report Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20 text-xs">
                  <div className="px-3 py-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Safety &amp; Moderation
                  </div>
                  <button
                    onClick={() => handleReportAndBlock('dating_or_romantic_solicitation')}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report: Dating / Flirting</span>
                  </button>
                  <button
                    onClick={() => handleReportAndBlock('harassment_or_abuse')}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report: Harassment</span>
                  </button>
                  <button
                    onClick={() => {
                      backendSocket.endSession();
                      onEndSession();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>End Session Gently</span>
                  </button>
                </div>
              )}
            </div>

            {/* End Session Button */}
            <button
              onClick={() => {
                backendSocket.endSession();
                onEndSession();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Support Standard Pill Banner */}
        <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Matched Preference: <strong>{session.supportPreference.replace(/_/g, ' ')}</strong>
            </span>
          </div>
          <span className="font-mono text-slate-400 text-[10px]">Real-time encrypted connection</span>
        </div>

        {/* Gentle Crisis Intervention Bar (if triggered) */}
        {showCrisisAlert && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Compassionate notice:</strong> If you are in acute crisis, free confidential lifelines are ready 24/7.
              </span>
            </div>
            <button
              onClick={onOpenCrisis}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-md text-[11px] font-bold hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
            >
              Get Free Help (14416)
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {reportReason ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
              Session terminated and peer permanently blocked. Safety is our priority.
            </div>
          ) : (
            <>
              {/* Welcome covenant notice */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-center max-w-md mx-auto text-xs text-slate-500 shadow-2xs">
                You are securely connected with an anonymous peer. Take all the time you need. No judgments, no unsolicited advice, no identities revealed.
              </div>

              {messages.map((msg) => {
                const isSelf = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-mono">{msg.senderTag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatTimestamp(msg.timestamp)}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isSelf
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isPeerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                  <span>{peer.alias} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Empathetic Prompt Suggestions */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
            Comfort prompts:
          </span>
          {[
            "Take all the time you need.",
            "I'm listening without any judgment.",
            "That sounds really exhausting.",
            "I'm right here with you.",
            "How does your body feel holding that?"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${peer.alias} in real time...`}
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </div>
  );
};
