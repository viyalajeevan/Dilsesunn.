import React, { useState } from 'react';
import { AnonymousUser, Post, TopicCategory } from '../types';
import { TOPICS } from '../constants/topics';
import { X, HeartHandshake, Shield, Sparkles, MessageCircle, PhoneCall } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  user: AnonymousUser;
  defaultTopic?: TopicCategory;
  onClose: () => void;
  onSubmitPost: (newPost: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'status'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  user,
  defaultTopic = 'loneliness',
  onClose,
  onSubmitPost
}) => {
  const [category, setCategory] = useState<TopicCategory>(defaultTopic);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [supportType, setSupportType] = useState<'vent_only' | 'advice_welcome' | 'similar_stories' | 'open_to_call'>('vent_only');
  const [allowDirectMessage, setAllowDirectMessage] = useState(true);
  const [allowDirectCall, setAllowDirectCall] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmitPost({
      title: title.trim(),
      content: content.trim(),
      category,
      authorTag: user.uniqueTag,
      authorAura: user.auraColor,
      supportType,
      allowDirectCall,
      allowDirectMessage
    });

    setTitle('');
    setContent('');
    onClose();
  };

  const handleUsePrompt = (prompt: string) => {
    setTitle(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Share with the Sanctuary</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Posting anonymously as</span>
              <span className="font-mono font-semibold text-slate-800">{user.uniqueTag}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Topic Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['loneliness', 'health', 'issues', 'fun'] as TopicCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-medium capitalize transition-colors cursor-pointer ${
                    category === cat
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick starter prompts for chosen category */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Thought starters for {TOPICS[category]?.name || category}:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS[category]?.starterPrompts?.map((p: string, idx: number) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleUsePrompt(p)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors text-left cursor-pointer"
                >
                  "{p.slice(0, 48)}..."
                </button>
              ))}
            </div>
          </div>

          {/* 2. Support Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              What kind of response are you hoping for?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSupportType('vent_only')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  supportType === 'vent_only'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>Just Venting (Listening Only)</div>
                <div className="text-[11px] font-normal text-slate-500">I just need to get this off my chest. No advice needed.</div>
              </button>

              <button
                type="button"
                onClick={() => setSupportType('advice_welcome')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  supportType === 'advice_welcome'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>Gentle Advice Welcome</div>
                <div className="text-[11px] font-normal text-slate-500">Open to compassionate perspectives &amp; constructive thoughts.</div>
              </button>

              <button
                type="button"
                onClick={() => setSupportType('similar_stories')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  supportType === 'similar_stories'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>Similar Experiences</div>
                <div className="text-[11px] font-normal text-slate-500">Has anyone else walked this path? Please share your story.</div>
              </button>

              <button
                type="button"
                onClick={() => setSupportType('open_to_call')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  supportType === 'open_to_call'
                    ? 'border-slate-900 bg-slate-50 font-semibold text-slate-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div>Open to Live Voice Call</div>
                <div className="text-[11px] font-normal text-slate-500">I’d appreciate a real-time voice call with someone right now.</div>
              </button>
            </div>
          </div>

          {/* 3. Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Headline / Summary
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What feels heavy or what would you like to discuss?"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* 4. Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Story / Thoughts (No identities, no pressure)
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take your time. Write as much or as little as you need. There is zero judgment here..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none leading-relaxed"
            />
          </div>

          {/* 5. Direct Connect Preferences */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">1-on-1 Contact Permissions</div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={allowDirectMessage}
                onChange={(e) => setAllowDirectMessage(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-slate-600" />
                Allow empathetic strangers to message me 1-on-1
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={allowDirectCall}
                onChange={(e) => setAllowDirectCall(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                Allow strangers to initiate an anonymous voice call with me
              </span>
            </label>
          </div>

          {/* Safe Space Reminder */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Anonymous, safe, and protected. Not a dating app. Disrespectful replies are banned.</span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Post Anonymously
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
