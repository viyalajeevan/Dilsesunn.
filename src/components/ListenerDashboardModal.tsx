import React, { useState, useEffect } from 'react';
import { AnonymousUser } from '../types';
import {
  SupportPreference,
  SupportTopic,
  MatchingStats
} from '../types/peerSupport';
import { backendSocket } from '../services/backendSocket';
import { X, Headphones, ShieldCheck, Check, Sparkles, AlertCircle, Users, Activity } from 'lucide-react';

interface ListenerDashboardModalProps {
  isOpen: boolean;
  user: AnonymousUser;
  onClose: () => void;
  stats: MatchingStats;
}

const SUPPORT_STYLES: { id: SupportPreference; label: string; desc: string }[] = [
  {
    id: 'listen_without_advice',
    label: 'Listen without advice',
    desc: 'Hold space and validate feelings without trying to fix or offer solutions.'
  },
  {
    id: 'different_perspective',
    label: 'Explore a different perspective',
    desc: 'Gently help reframe or brainstorm new constructive ways of viewing the situation.'
  },
  {
    id: 'similar_experience',
    label: 'Similar lived experience',
    desc: 'Connect as someone who has walked through illness, family loss, or similar crossroads.'
  },
  {
    id: 'keep_company',
    label: 'Keep me company',
    desc: 'Low-pressure, quiet human presence. No heavy digging required.'
  },
  {
    id: 'lighthearted',
    label: 'Lighthearted conversation / distraction',
    desc: 'Cheery banter, wholesome hobbies, gentle humor to lift the spirits.'
  }
];

const TOPIC_LIST: { id: SupportTopic; label: string }[] = [
  { id: 'anything', label: 'Anything on their mind' },
  { id: 'health', label: 'Health, illness or uncertainty' },
  { id: 'family', label: 'Family and relationships' },
  { id: 'work', label: 'Work, finances or career' },
  { id: 'grief', label: 'Grief, loneliness or life changes' },
  { id: 'other', label: 'Other' }
];

export const ListenerDashboardModal: React.FC<ListenerDashboardModalProps> = ({
  isOpen,
  user,
  onClose,
  stats
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<SupportPreference[]>([
    'listen_without_advice',
    'different_perspective',
    'keep_company',
    'lighthearted'
  ]);
  const [selectedTopics, setSelectedTopics] = useState<SupportTopic[]>([
    'anything',
    'health',
    'family',
    'work',
    'grief',
    'other'
  ]);
  const [selectedModes, setSelectedModes] = useState<('text' | 'voice')[]>(['text', 'voice']);
  const [hasAgreedToRules, setHasAgreedToRules] = useState(true);

  if (!isOpen) return null;

  const handleToggleStyle = (styleId: SupportPreference) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId) ? prev.filter((s) => s !== styleId) : [...prev, styleId]
    );
  };

  const handleToggleTopic = (topicId: SupportTopic) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const handleToggleMode = (mode: 'text' | 'voice') => {
    setSelectedModes((prev) => {
      if (prev.includes(mode) && prev.length === 1) return prev; // keep at least 1
      return prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode];
    });
  };

  const handleApplyAvailability = (newStatus: boolean) => {
    if (newStatus && (!hasAgreedToRules || selectedStyles.length === 0)) return;
    setIsAvailable(newStatus);
    backendSocket.setListenerAvailability(
      newStatus,
      selectedStyles,
      selectedTopics,
      selectedModes
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Headphones className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Be a Shoulder (Listener Portal)</h2>
            <p className="text-xs text-slate-500">
              Offer anonymous, empathetic, non-judgmental listening to people in need.
            </p>
          </div>
        </div>

        {/* Live Network Health Strip */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Live Network Telemetry:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono tabular-nums">
            <span>Online: <strong>{stats.onlineUsersCount}</strong></span>
            <span>·</span>
            <span>Available Listeners: <strong>{stats.availableListenersCount}</strong></span>
            <span>·</span>
            <span>Waiting in Queue: <strong>{stats.queueLength}</strong></span>
          </div>
        </div>

        {/* Main Availability Toggle */}
        <div className="mb-6 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Your Listener Availability:</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {isAvailable ? 'Online & Ready to Listen' : 'Offline / Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              When online, you will automatically receive match requests that strictly match your selected support styles and comfort boundaries.
            </p>
          </div>

          <button
            onClick={() => handleApplyAvailability(!isAvailable)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              isAvailable
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            {isAvailable ? 'Go Offline' : 'Go Online to Listen'}
          </button>
        </div>

        {/* Support Styles Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              1. Support Styles You Are Willing to Provide
            </label>
            <p className="text-xs text-slate-500 mb-3">
              CRITICAL: A user requesting "Listen without advice" will only ever be matched with listeners who explicitly check this box.
            </p>
            <div className="space-y-2">
              {SUPPORT_STYLES.map((style) => {
                const checked = selectedStyles.includes(style.id);
                return (
                  <label
                    key={style.id}
                    onClick={() => handleToggleStyle(style.id)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                      checked ? 'border-slate-900 bg-slate-50/80' : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-1 rounded text-slate-900 focus:ring-slate-900"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-slate-900">{style.label}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{style.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Topics of Comfort */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Topics You Feel Comfortable Holding Space For
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {TOPIC_LIST.map((topic) => {
                const checked = selectedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      checked
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {checked && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      <span className="truncate">{topic.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Communication Modes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              3. Accepted Communication Modes
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleToggleMode('text')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  selectedModes.includes('text')
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <div>Anonymous Text Chat</div>
                <div className="text-[11px] opacity-80 mt-0.5">Reliable real-time messaging</div>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('voice')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  selectedModes.includes('voice')
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <div>Voice Conversation</div>
                <div className="text-[11px] opacity-80 mt-0.5">WebRTC audio peer calls</div>
              </button>
            </div>
          </div>
        </div>

        {/* Safety Agreement */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 mb-6">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreedToRules}
              onChange={(e) => setHasAgreedToRules(e.target.checked)}
              className="mt-0.5 rounded text-amber-700 focus:ring-amber-700"
            />
            <span className="leading-relaxed">
              <strong>Listener Pledge:</strong> I agree to listen without judgment or condescension. I understand DilSeSunn is NOT a dating or flirtation app, and I will never solicit romantic contact or personal identities.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
