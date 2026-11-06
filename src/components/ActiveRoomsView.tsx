import React from 'react';
import { AnonymousUser } from '../types';
import { SupportTopic } from '../types/peerSupport';
import { SUPPORT_TOPICS } from '../constants/topics';
import { MessageSquare, PhoneCall, Headphones, Sparkles, HeartHandshake } from 'lucide-react';

interface ActiveRoomsViewProps {
  user: AnonymousUser;
  onOpenMatchmakerWithTopic: (topic: SupportTopic, mode: 'text' | 'voice') => void;
}

export const ActiveRoomsView: React.FC<ActiveRoomsViewProps> = ({
  user,
  onOpenMatchmakerWithTopic
}) => {
  const topics: SupportTopic[] = ['anything', 'health', 'family', 'work', 'grief', 'other'];

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>DilSeSunn Peer Rooms</span>
            <span aria-hidden="true">·</span>
            <span>Zero Judgments</span>
            <span aria-hidden="true">·</span>
            <span>Empathetic Human Listening</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            Explore Emotional Support Spaces
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Whether you are coping with a sudden illness diagnosis, carrying heavy work anxiety, untangling family knots, or simply feeling isolated at 11 PM—select a space to request an eligible listener or offer a shoulder yourself.
          </p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((cat) => {
          const topic = SUPPORT_TOPICS[cat];

          return (
            <div
              key={cat}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={topic.image}
                  alt={topic.name}
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white capitalize">{topic.name}</h3>
                    <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-1">{topic.tagline}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {topic.description}
                </p>

                {/* Starters */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium mb-1">Common themes:</div>
                  <div className="text-xs text-slate-700 italic line-clamp-2">
                    "{topic.starterPrompts[0]}"
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onOpenMatchmakerWithTopic(cat, 'text')}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Match Text</span>
                  </button>

                  <button
                    onClick={() => onOpenMatchmakerWithTopic(cat, 'voice')}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Match Voice</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
