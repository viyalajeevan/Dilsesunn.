import React, { useState } from 'react';
import { Post, TopicCategory } from '../types';
import { TOPICS } from '../constants/topics';
import { MessageSquare, PhoneCall, Heart, Send, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onSelectPost: (post: Post) => void;
  onDirectMessage: (post: Post) => void;
  onDirectCall: (post: Post) => void;
  onAddReaction: (postId: string, reactionType: 'hear_you' | 'warm_hug' | 'strength' | 'breathe') => void;
  onAddComment: (postId: string, text: string) => void;
}

const SUPPORT_TYPE_LABELS = {
  vent_only: 'Just Venting (Listening Only)',
  advice_welcome: 'Gentle Advice Welcome',
  similar_stories: 'Similar Experiences Welcome',
  open_to_call: 'Open to a Live Voice Call'
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onSelectPost,
  onDirectMessage,
  onDirectCall,
  onAddReaction,
  onAddComment
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reactedTypes, setReactedTypes] = useState<Record<string, boolean>>({});

  const topic = TOPICS[post.category];

  const handleReactionClick = (
    e: React.MouseEvent,
    type: 'hear_you' | 'warm_hug' | 'strength' | 'breathe'
  ) => {
    e.stopPropagation();
    if (reactedTypes[type]) return;

    setReactedTypes((prev) => ({ ...prev, [type]: true }));
    onAddReaction(post.id, type);

    // Subtle gentle confetti feedback for warm hugs
    if (type === 'warm_hug' || type === 'hear_you') {
      try {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        confetti({
          particleCount: 16,
          spread: 45,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#f43f5e', '#6366f1', '#10b981', '#f59e0b']
        });
      } catch (err) {
        // fallback silently
      }
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddComment(post.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 hover:border-slate-300 transition-all shadow-xs min-w-0 overflow-hidden break-words">
      
      {/* Clean Unboxed Metadata with · separator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: post.authorAura }}
          />
          <span className="font-mono font-medium text-slate-700">{post.authorTag}</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium capitalize text-slate-800">{topic?.name || post.category}</span>
          <span aria-hidden="true">·</span>
          <span>{SUPPORT_TYPE_LABELS[post.supportType]}</span>
        </div>

        <span className="tabular-nums text-slate-400">{post.createdAt}</span>
      </div>

      {/* Main Title & Story */}
      <h3
        onClick={() => onSelectPost(post)}
        className="text-base sm:text-lg font-bold text-slate-900 mb-2.5 hover:text-indigo-900 cursor-pointer transition-colors leading-snug"
      >
        {post.title}
      </h3>

      <p
        onClick={() => onSelectPost(post)}
        className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5 cursor-pointer whitespace-pre-line"
      >
        {post.content}
      </p>

      {/* Action Strip: Reactions & Direct Connect (Message / Call) */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        
        {/* Empathetic Reaction Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={(e) => handleReactionClick(e, 'hear_you')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              reactedTypes['hear_you']
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="I hear you"
          >
            <span>👂</span>
            <span>I hear you</span>
            <span className="tabular-nums text-slate-400 text-[11px]">{post.reactions.hear_you}</span>
          </button>

          <button
            onClick={(e) => handleReactionClick(e, 'warm_hug')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              reactedTypes['warm_hug']
                ? 'bg-rose-50 text-rose-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Sending a warm hug"
          >
            <span>🫂</span>
            <span>Warm hug</span>
            <span className="tabular-nums text-slate-400 text-[11px]">{post.reactions.warm_hug}</span>
          </button>

          <button
            onClick={(e) => handleReactionClick(e, 'strength')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              reactedTypes['strength']
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Sending strength"
          >
            <span>🕊️</span>
            <span>Strength</span>
            <span className="tabular-nums text-slate-400 text-[11px]">{post.reactions.strength}</span>
          </button>
        </div>

        {/* Reply & Direct Connect Affordances (Message / Call) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support ({post.comments.length})</span>
          </button>

          {post.allowDirectMessage && (
            <button
              onClick={() => onDirectMessage(post)}
              title="Start a 1-on-1 private anonymous message with this person"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Message</span>
            </button>
          )}

          {post.allowDirectCall && (
            <button
              onClick={() => onDirectCall(post)}
              title="Start an anonymous voice call with this person"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span>Call</span>
            </button>
          )}
        </div>

      </div>

      {/* Inline Reply Input */}
      {isReplying && (
        <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Leave an anonymous, empathetic reply..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              autoFocus
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </form>
      )}

      {/* Highlighted Top Empathetic Comment if exists */}
      {post.comments.length > 0 && !isReplying && (
        <div
          onClick={() => onSelectPost(post)}
          className="mt-3.5 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-100 text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: post.comments[0].authorAura }}
            />
            <span className="font-mono font-medium text-slate-700">{post.comments[0].authorTag}</span>
            <span aria-hidden="true">·</span>
            <span>{post.comments[0].createdAt}</span>
          </div>
          <p className="text-slate-700 line-clamp-2 leading-relaxed">
            {post.comments[0].content}
          </p>
          {post.comments.length > 1 && (
            <div className="mt-1.5 text-[11px] text-indigo-600 font-medium">
              View all {post.comments.length} responses →
            </div>
          )}
        </div>
      )}

    </article>
  );
};
