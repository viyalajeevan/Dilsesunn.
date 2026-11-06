import React, { useState } from 'react';
import { Post, Comment, AnonymousUser } from '../types';
import { TOPICS } from '../constants/topics';
import { X, MessageSquare, PhoneCall, Heart, Send, ThumbsUp, Shield, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostDetailModalProps {
  post: Post | null;
  currentUser: AnonymousUser;
  onClose: () => void;
  onDirectMessage: (post: Post) => void;
  onDirectCall: (post: Post) => void;
  onAddReaction: (postId: string, reactionType: 'hear_you' | 'warm_hug' | 'strength' | 'breathe') => void;
  onAddComment: (postId: string, text: string) => void;
  onVoteComment: (postId: string, commentId: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUser,
  onClose,
  onDirectMessage,
  onDirectCall,
  onAddReaction,
  onAddComment,
  onVoteComment
}) => {
  const [newComment, setNewComment] = useState('');

  if (!post) return null;

  const topic = TOPICS[post.category];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(post.id, newComment.trim());
    setNewComment('');
  };

  const handleReaction = (type: 'hear_you' | 'warm_hug' | 'strength' | 'breathe', e: React.MouseEvent) => {
    onAddReaction(post.id, type);
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 18,
        spread: 45,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        }
      });
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: post.authorAura }}
            />
            <span className="font-mono font-medium text-slate-700">{post.authorTag}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium capitalize text-slate-800">{topic?.name || post.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{post.createdAt}</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
            {post.title}
          </h2>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6 pb-6 border-b border-slate-100">
            {post.content}
          </div>

          {/* Direct 1-on-1 Contact Actions */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-800">Direct 1-on-1 Connection Available</div>
              <div className="text-xs text-slate-500">Would you like to offer a listening ear directly to this person?</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {post.allowDirectMessage && (
                <button
                  onClick={() => onDirectMessage(post)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              )}
              {post.allowDirectCall && (
                <button
                  onClick={() => onDirectCall(post)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Call Author</span>
                </button>
              )}
            </div>
          </div>

          {/* Reactions bar */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={(e) => handleReaction('hear_you', e)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>👂</span>
              <span>I hear you</span>
              <span className="font-mono text-slate-500 text-[11px]">{post.reactions.hear_you}</span>
            </button>

            <button
              onClick={(e) => handleReaction('warm_hug', e)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🫂</span>
              <span>Warm hug</span>
              <span className="font-mono text-slate-500 text-[11px]">{post.reactions.warm_hug}</span>
            </button>

            <button
              onClick={(e) => handleReaction('strength', e)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🕊️</span>
              <span>Strength</span>
              <span className="font-mono text-slate-500 text-[11px]">{post.reactions.strength}</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Supportive Responses ({post.comments.length})
            </h4>

            {post.comments.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 text-xs text-slate-500">
                Be the first person to offer a compassionate shoulder and gentle words.
              </div>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: comment.authorAura }}
                      />
                      <span className="font-mono font-medium text-slate-700">{comment.authorTag}</span>
                      <span aria-hidden="true">·</span>
                      <span>{comment.createdAt}</span>
                    </div>

                    <button
                      onClick={() => onVoteComment(post.id, comment.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="This response was comforting/helpful"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="tabular-nums font-mono">{comment.isHelpfulVoteCount}</span>
                    </button>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Box Footer */}
        <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Reply empathetically as ${currentUser.uniqueTag}...`}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Support</span>
          </button>
        </form>
      </div>
    </div>
  );
};
