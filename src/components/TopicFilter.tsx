import React from 'react';
import { TopicCategory } from '../types';
import { TOPICS } from '../constants/topics';
import { Sparkles, HeartPulse, HelpCircle, Moon, Compass } from 'lucide-react';

interface TopicFilterProps {
  selectedTopic: TopicCategory | 'all';
  onSelectTopic: (topic: TopicCategory | 'all') => void;
  onOpenMatchmakerWithTopic?: (topic: TopicCategory) => void;
}

export const TopicFilter: React.FC<TopicFilterProps> = ({
  selectedTopic,
  onSelectTopic,
  onOpenMatchmakerWithTopic
}) => {
  const topicList: { id: TopicCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Sanctuary', icon: <Compass className="w-4 h-4" /> },
    { id: 'loneliness', label: 'Loneliness', icon: <Moon className="w-4 h-4" /> },
    { id: 'health', label: 'Health', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'issues', label: 'Issues', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'fun', label: 'Fun', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="mb-8">
      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl max-w-full overflow-x-auto scrollbar-none">
        {topicList.map((item) => {
          const isActive = selectedTopic === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTopic(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* When a specific topic is selected, render a quiet, elegant topic banner */}
      {selectedTopic !== 'all' && (() => {
        const topicMeta = TOPICS[selectedTopic] || TOPICS.anything || {
          name: selectedTopic,
          tagline: 'Empathetic listening space',
          description: 'Share your thoughts with an anonymous listener.',
          image: '/hero-sanctuary.jpg'
        };

        return (
          <div className="mt-4 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 overflow-hidden">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                <img
                  src={topicMeta.image || '/hero-sanctuary.jpg'}
                  alt={topicMeta.name || selectedTopic}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallbackTried) {
                      target.dataset.fallbackTried = 'true';
                      target.src = '/hero-sanctuary.jpg';
                    }
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                    {topicMeta.name || selectedTopic}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="truncate">{topicMeta.tagline}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed break-words">
                  {topicMeta.description}
                </p>
              </div>
            </div>

            {onOpenMatchmakerWithTopic && (
              <button
                onClick={() => onOpenMatchmakerWithTopic(selectedTopic)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center shrink-0"
              >
                Find a Peer in {topicMeta.name || selectedTopic}
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
};
