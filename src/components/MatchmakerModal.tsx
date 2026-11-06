import React, { useState, useEffect } from 'react';
import { AnonymousUser } from '../types';
import {
  SupportPreference,
  SupportTopic,
  CommunicationPreference,
  MatchingStats
} from '../types/peerSupport';
import { SUPPORT_TOPICS } from '../constants/topics';
import { backendSocket } from '../services/backendSocket';
import {
  X,
  MessageSquare,
  PhoneCall,
  Heart,
  Headphones,
  Sparkles,
  ShieldCheck,
  Compass,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface MatchmakerModalProps {
  isOpen: boolean;
  user: AnonymousUser;
  onClose: () => void;
  stats: MatchingStats;
  onOpenListenerPortal: () => void;
}

const SUPPORT_PREFERENCES: {
  id: SupportPreference;
  label: string;
  tagline: string;
}[] = [
  {
    id: 'listen_without_advice',
    label: '1. Listen without advice',
    tagline: 'Just hold space, acknowledge feelings, and listen without trying to fix anything.'
  },
  {
    id: 'different_perspective',
    label: '2. Help me explore a different perspective',
    tagline: 'Gently brainstorm constructive angles or alternative ways of viewing the situation.'
  },
  {
    id: 'similar_experience',
    label: '3. Connect with similar lived experience',
    tagline: 'Match with someone who has personally walked through illness, family strife, or loss.'
  },
  {
    id: 'keep_company',
    label: '4. Keep me company',
    tagline: 'Quiet, peaceful human presence. No pressure to explain or dig deep.'
  },
  {
    id: 'lighthearted',
    label: '5. Have a lighthearted conversation or distraction',
    tagline: 'Wholesome distraction, gentle jokes, hobby banter to take your mind off stress.'
  }
];

const TOPICS_LIST: { id: SupportTopic; label: string; desc: string }[] = [
  { id: 'anything', label: 'Anything on my mind', desc: 'No specific topic. Does NOT reduce matching chances.' },
  { id: 'health', label: 'Health, illness or uncertainty', desc: 'Medical diagnosis, test anxiety, chronic conditions, physical burnout.' },
  { id: 'family', label: 'Family and relationships', desc: 'Complicated relatives, parenting strain, personal boundary burnout.' },
  { id: 'work', label: 'Work, finances or career', desc: 'Job burnout, career cross-roads, monetary knot, workplace dread.' },
  { id: 'grief', label: 'Grief, loneliness or life changes', desc: 'Late night quiet, losing someone, moving cities, feeling disconnected.' },
  { id: 'other', label: 'Other', desc: 'Unique circumstances or thoughts that do not fit a box.' }
];

export const MatchmakerModal: React.FC<MatchmakerModalProps> = ({
  isOpen,
  user,
  onClose,
  stats,
  onOpenListenerPortal
}) => {
  const [supportPreference, setSupportPreference] = useState<SupportPreference>('listen_without_advice');
  const [topic, setTopic] = useState<SupportTopic>('anything');
  const [communicationMode, setCommunicationMode] = useState<CommunicationPreference>('text');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true);

  // Queue State
  const [isQueued, setIsQueued] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [waitingElapsedSeconds, setWaitingElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQueued) {
      timer = setInterval(() => {
        setWaitingElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setWaitingElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isQueued]);

  // Subscribe to WebSocket match notifications
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = backendSocket.subscribe((event) => {
      if (event.type === 'MATCH_REQUEST_QUEUED') {
        setIsQueued(true);
        setQueuePosition(event.payload.position);
      } else if (event.type === 'MATCH_FOUND') {
        setIsQueued(false);
        onClose();
      } else if (event.type === 'MATCH_REQUEST_CANCELLED') {
        setIsQueued(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartMatching = () => {
    if (!isAgeConfirmed) return;
    backendSocket.requestMatch({
      supportPreference,
      topic,
      communicationMode
    });
  };

  const handleCancelQueue = () => {
    backendSocket.cancelMatchRequest();
    setIsQueued(false);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <button
          onClick={() => {
            if (isQueued) handleCancelQueue();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isQueued ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Headphones className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">I Just Need Someone to Listen</h2>
                <p className="text-xs text-slate-500">
                  Real-time anonymous match with an eligible peer listener. No registration or problem disclosure required.
                </p>
              </div>
            </div>

            {/* Live Listener Availability Bar */}
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 font-medium">Real-Time Listeners:</span>
              </div>
              <div className="font-mono text-slate-800">
                <strong>{stats.availableListenersCount}</strong> online &amp; ready
              </div>
            </div>

            <div className="space-y-6 text-xs sm:text-sm">
              {/* 1. Support Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  1. How would you like your listener to support you?
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Select your desired listening style. Safety rule: If you pick "Listen without advice", you will only be paired with listeners who explicitly agreed to that standard.
                </p>
                <div className="space-y-2">
                  {SUPPORT_PREFERENCES.map((pref) => {
                    const isSelected = supportPreference === pref.id;
                    return (
                      <div
                        key={pref.id}
                        onClick={() => setSupportPreference(pref.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="font-semibold text-xs sm:text-sm">{pref.label}</div>
                        <div
                          className={`text-[11px] mt-0.5 leading-relaxed ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {pref.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Optional Topic Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  2. Topic (Optional)
                </label>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Choosing "Anything on my mind" never reduces your chances of finding a suitable listener.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {TOPICS_LIST.map((t) => {
                    const isSelected = topic === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setTopic(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-semibold">{t.label}</div>
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5 line-clamp-1">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Communication Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  3. Communication Preference
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCommunicationMode('text')}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      communicationMode === 'text'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <div>Anonymous Text</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommunicationMode('voice')}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      communicationMode === 'voice'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <div>Voice Call</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCommunicationMode('either')}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      communicationMode === 'either'
                        ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Compass className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <div>Either Mode</div>
                  </button>
                </div>
              </div>

              {/* Age policy & safe covenant */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAgeConfirmed}
                    onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>
                    I confirm I am at least 16 years of age and agree to DilSeSunn's non-dating, respectful peer-support covenant.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!isAgeConfirmed}
                  onClick={handleStartMatching}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-indigo-300" />
                  <span>Request a Listening Shoulder</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Live Real Queue View */
          <div className="py-8 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-60" />
              <div className="absolute inset-2 rounded-full bg-indigo-50 border border-indigo-200" />
              <div className="relative z-10 w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Headphones className="w-5 h-5 text-indigo-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Waiting for an Available Listener
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your request is live on the server. We only pair you with real, verified listeners who match your safety criteria.
              </p>
            </div>

            {/* Real Queue Position & Timer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-xs mx-auto text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-slate-600">
                <span>Queue Position:</span>
                <span className="font-bold text-slate-900 text-sm">#{queuePosition ?? 1}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Time in Queue:</span>
                <span className="font-bold text-indigo-600 tabular-nums">
                  {formatSeconds(waitingElapsedSeconds)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Requested Style:</span>
                <span className="font-bold text-slate-800 truncate max-w-[130px]">
                  {supportPreference.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Multi-Tab Testing Tip */}
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 max-w-md mx-auto text-left">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Testing with two browser tabs?
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Open another tab or window, click <strong>"Be a Shoulder (Go Online)"</strong>, and you can test the live matching, text chat, and audio calling between the two tabs immediately!
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                onClick={handleCancelQueue}
                className="px-5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel Matching Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
