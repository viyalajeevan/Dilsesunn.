import React, { useState, useEffect } from 'react';
import { AnonymousUser, Post } from './types';
import { getStoredUser, saveStoredUser } from './utils/identity';
import { INITIAL_POSTS } from './constants/mockData';
import { SUPPORT_TOPICS } from './constants/topics';
import {
  ActiveSession,
  MatchingStats,
  SupportTopic
} from './types/peerSupport';
import { backendSocket } from './services/backendSocket';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { TopicFilter } from './components/TopicFilter';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { PostDetailModal } from './components/PostDetailModal';
import { MatchmakerModal } from './components/MatchmakerModal';
import { ListenerDashboardModal } from './components/ListenerDashboardModal';
import { LiveChatSession } from './components/LiveChatSession';
import { LiveCallSession } from './components/LiveCallSession';
import { IdentityModal } from './components/IdentityModal';
import { GuidelinesModal } from './components/GuidelinesModal';
import { CrisisModal } from './components/CrisisModal';
import { ActiveRoomsView } from './components/ActiveRoomsView';
import { InstallAppModal } from './components/InstallAppModal';
import heroPeacefulImg from './assets/images/hero_peaceful_sanctuary_1792226308483.jpg';
import { isDilSeSunnAndroidApp } from './utils/platform';
import {
  PenLine,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
  Search,
  Filter,
  Sparkles,
  Heart,
  Headphones,
  Users,
  Activity,
  Layers
} from 'lucide-react';

export default function App() {
  const isAndroidNativeApp = isDilSeSunnAndroidApp();
  const [user, setUser] = useState<AnonymousUser>(() => getStoredUser());
  const [stats, setStats] = useState<MatchingStats>({
    onlineUsersCount: 1,
    availableListenersCount: 0,
    activeSessionsCount: 0,
    queueLength: 0
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('kind_shoulder_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return INITIAL_POSTS;
  });

  const [activeTab, setActiveTab] = useState<'sanctuary' | 'rooms' | 'resources'>('sanctuary');
  const [selectedTopic, setSelectedTopic] = useState<any>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'needs_listener' | 'most_supported'>('latest');

  // Modals
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
  const [isListenerPortalOpen, setIsListenerPortalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isIdentityOpen, setIsIdentityOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Active Real Session
  const [activeSession, setActiveSession] = useState<{
    session: ActiveSession;
    role: 'requester' | 'listener';
    peer: {
      userId: string;
      uniqueTag: string;
      alias: string;
      auraColor: string;
    };
    mode: 'text' | 'voice';
  } | null>(null);

  // Initialize Backend WebSocket on mount
  useEffect(() => {
    backendSocket.init(user);

    const unsubscribe = backendSocket.subscribe((event) => {
      if (event.type === 'STATS_UPDATE') {
        setStats(event.payload);
      } else if (event.type === 'MATCH_FOUND') {
        const { session, role, peer } = event.payload;
        setActiveSession({
          session,
          role,
          peer,
          mode: session.communicationMode
        });
      } else if (event.type === 'SESSION_ENDED' || event.type === 'SESSION_TERMINATED_SAFETY') {
        setActiveSession(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update profile in socket when user details change
  const handleUpdateUser = (updated: AnonymousUser) => {
    setUser(updated);
    saveStoredUser(updated);
    backendSocket.updateProfile(updated);
  };

  useEffect(() => {
    try {
      localStorage.setItem('kind_shoulder_posts', JSON.stringify(posts));
    } catch (e) {
      // ignore
    }
  }, [posts]);

  // Post creation
  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'createdAt' | 'reactions' | 'comments' | 'status'>) => {
    const created: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      createdAt: 'Just now',
      reactions: {
        hear_you: 1,
        warm_hug: 1,
        strength: 1,
        breathe: 0
      },
      comments: [],
      status: 'open'
    };

    setPosts([created, ...posts]);
  };

  const handleAddReaction = (postId: string, reactionType: 'hear_you' | 'warm_hug' | 'strength' | 'breathe') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: p.reactions[reactionType] + 1
          }
        };
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((sp) => {
        if (!sp) return null;
        return {
          ...sp,
          reactions: {
            ...sp.reactions,
            [reactionType]: sp.reactions[reactionType] + 1
          }
        };
      });
    }
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      postId,
      authorTag: user.uniqueTag,
      authorAura: user.auraColor,
      content: text,
      createdAt: 'Just now',
      isHelpfulVoteCount: 0,
      userVoted: false
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [newComment, ...p.comments]
        };
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((sp) => {
        if (!sp) return null;
        return {
          ...sp,
          comments: [newComment, ...sp.comments]
        };
      });
    }
  };

  const handleVoteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) =>
            c.id === commentId ? { ...c, isHelpfulVoteCount: c.isHelpfulVoteCount + 1 } : c
          )
        };
      })
    );
  };

  // Direct connects from posts
  const handleDirectMessageFromPost = (post: Post) => {
    setSelectedPost(null);
    setIsMatchmakerOpen(true);
  };

  const handleDirectCallFromPost = (post: Post) => {
    setSelectedPost(null);
    setIsMatchmakerOpen(true);
  };

  const filteredPosts = (posts || [])
    .filter((p) => {
      if (!p) return false;
      if (selectedTopic !== 'all' && p.category !== selectedTopic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.authorTag || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'needs_listener') {
        const lenA = a.comments?.length || 0;
        const lenB = b.comments?.length || 0;
        return lenA - lenB;
      }
      if (sortBy === 'most_supported') {
        const sumA = (a.reactions?.hear_you || 0) + (a.reactions?.warm_hug || 0) + (a.reactions?.strength || 0);
        const sumB = (b.reactions?.hear_you || 0) + (b.reactions?.warm_hug || 0) + (b.reactions?.strength || 0);
        return sumB - sumA;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Banner: Non-Dating Covenant & Crisis Hotlines */}
      <SafetyBanner
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenCrisis={() => setIsCrisisOpen(true)}
      />

      {/* Main App Navigation Header */}
      <Header
        user={user}
        stats={stats}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMatchmaker={() => setIsMatchmakerOpen(true)}
        onOpenListenerPortal={() => setIsListenerPortalOpen(true)}
        onOpenIdentityModal={() => setIsIdentityOpen(true)}
        onOpenGuidelinesModal={() => setIsGuidelinesOpen(true)}
        onOpenCrisisModal={() => setIsCrisisOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-hidden min-w-0">
        
        {/* TAB 1: Sanctuary Community Feed */}
        {activeTab === 'sanctuary' && (
          <div className="w-full min-w-0">
            {/* Hero Section */}
            <section className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-4 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 sm:space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-indigo-300 font-semibold mb-2 sm:mb-3">
                      <HeartHandshake className="w-4 h-4 shrink-0" />
                      <span>Compassionate Peer Network</span>
                      <span aria-hidden="true" className="text-slate-600 hidden xs:inline">·</span>
                      <span className="text-slate-400">100% Undisclosed Identity</span>
                    </div>

                    <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight text-balance">
                      A shoulder to listen when life feels heavy.
                    </h1>

                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed max-w-xl">
                      Born from the personal need for a listening ear outside the family during life's hardest moments. Share your fears, illness, loneliness, relationship stress, or grief with anonymous individuals willing to listen without judgement.
                    </p>
                  </div>

                  {/* Primary CTA Buttons (Fully responsive on 360px phones, 800px tablets, desktop) */}
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full">
                    {/* The Primary Action requested by user */}
                    <button
                      onClick={() => setIsMatchmakerOpen(true)}
                      className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-rose-300 text-rose-300 shrink-0" />
                      <span className="text-center">“I just need someone to listen”</span>
                    </button>

                    {/* Secondary Action: Be a Shoulder */}
                    <button
                      onClick={() => setIsListenerPortalOpen(true)}
                      className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-transform active:scale-[0.99] cursor-pointer"
                    >
                      <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-center">Be a Shoulder (Go Online)</span>
                    </button>

                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <PenLine className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="text-center">Post to Wall</span>
                    </button>
                  </div>

                  {/* Live Network Telemetry Strip */}
                  <div className="pt-3 sm:pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      {stats.availableListenersCount} Available Listeners
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="font-mono">{stats.onlineUsersCount} Online Peers</span>
                    <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>
                    <span className="hidden sm:inline">No fake users, 100% genuine humans</span>
                  </div>
                </div>

                {/* Hero Scenic Image: Cozy listening armchairs looking into misty pine valley */}
                <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full overflow-hidden bg-slate-950">
                  <img
                    src={heroPeacefulImg}
                    alt="Cozy listening armchairs looking into misty pine valley"
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackTried) {
                        target.dataset.fallbackTried = 'true';
                        target.src = '/hero-sanctuary.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent pointer-events-none" />
                </div>
              </div>
            </section>

            {/* Real Multi-Tab Peer Testing Reassurance */}
            <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">Want to test live two-way matching right now?</span>
                  <p className="text-slate-500 mt-0.5">
                    Open DilSeSunn in a second tab or window, click <strong>"Be a Shoulder"</strong> to go online as a listener, then request a match in this tab!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsListenerPortalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
              >
                Open Listener Portal
              </button>
            </div>

            {/* Topic Filter */}
            <TopicFilter
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
              onOpenMatchmakerWithTopic={() => setIsMatchmakerOpen(true)}
            />

            {/* Search & Sort Strip */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shared stories, topics, or feelings..."
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs self-end sm:self-auto">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    sortBy === 'latest' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy('needs_listener')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    sortBy === 'needs_listener' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Needs a Listener
                </button>
                <button
                  onClick={() => setSortBy('most_supported')}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    sortBy === 'most_supported' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Most Supported
                </button>
              </div>
            </div>

            {/* Stories Grid */}
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-3">No posts found matching your search.</p>
                <button
                  onClick={() => { setSelectedTopic('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                    onSelectPost={setSelectedPost}
                    onDirectMessage={handleDirectMessageFromPost}
                    onDirectCall={handleDirectCallFromPost}
                    onAddReaction={handleAddReaction}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Support Topics & Rooms */}
        {activeTab === 'rooms' && (
          <ActiveRoomsView
            user={user}
            onOpenMatchmakerWithTopic={(topic, mode) => {
              setIsMatchmakerOpen(true);
            }}
          />
        )}

        {/* TAB 3: Safe Space Covenant */}
        {activeTab === 'resources' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Our Non-Dating &amp; Safety Covenant</h2>
                <p className="text-xs text-slate-500">Protecting vulnerable emotional conversations.</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <strong className="text-amber-900 block mb-1">Strict Anti-Dating Policy:</strong>
                DilSeSunn is not a dating service, hookup platform, or flirtatious chatroom. Users come here during illness diagnosis, heartbreak, anxiety, burnout, or grief. Soliciting dates, asking for photos, or sending unwanted romantic advances triggers permanent account removal.
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Total Identity Anonymity:</strong>
                Each user is assigned a random unique tag (e.g. {user.uniqueTag}). You never need to supply your name, phone number, or social media. Protect your privacy by refusing to share external contact details.
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Emergency Resources:</strong>
                If someone indicates immediate intent to harm themselves or others, please direct them to call <strong>Tele-MANAS (14416 / 1800-891-4416)</strong> or National Emergency <strong>112</strong> immediately.
              </div>
            </div>

            <button
              onClick={() => setActiveTab('sanctuary')}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Return to Sanctuary Wall
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 sm:mt-16 bg-white border-t border-slate-200 py-6 sm:py-8 px-4 sm:px-6 text-xs text-slate-500 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-slate-900">DilSeSunn</span>
            <span aria-hidden="true">·</span>
            <span>Anonymous Peer Support Haven</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Not a dating app</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4">
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Safety Covenant
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCrisisOpen(true)}
              className="text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
            >
              Crisis (14416)
            </button>

            {/* ONLY show App install promotion if NOT running inside native Android wrapper app */}
            {!isAndroidNativeApp && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsInstallModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer"
                >
                  Get App (APK / iPhone)
                </button>
              </>
            )}

            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">ID: {user.uniqueTag}</span>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Action Button: "I just need someone to listen" (< 768px) */}
      <div className="fixed bottom-4 right-4 z-30 md:hidden max-w-[calc(100vw-2rem)]">
        <button
          onClick={() => setIsMatchmakerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-950/30 text-xs font-bold transition-all active:scale-95 cursor-pointer max-w-full"
          aria-label="I just need someone to listen"
        >
          <Heart className="w-4 h-4 fill-rose-300 text-rose-300 shrink-0" />
          <span className="truncate">Need someone to listen</span>
        </button>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        user={user}
        defaultTopic={'loneliness'}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmitPost={handleCreatePost}
      />

      <PostDetailModal
        post={selectedPost}
        currentUser={user}
        onClose={() => setSelectedPost(null)}
        onDirectMessage={handleDirectMessageFromPost}
        onDirectCall={handleDirectCallFromPost}
        onAddReaction={handleAddReaction}
        onAddComment={handleAddComment}
        onVoteComment={handleVoteComment}
      />

      {/* The Core Matchmaker Modal ("I just need someone to listen") */}
      <MatchmakerModal
        isOpen={isMatchmakerOpen}
        user={user}
        stats={stats}
        onClose={() => setIsMatchmakerOpen(false)}
        onOpenListenerPortal={() => {
          setIsMatchmakerOpen(false);
          setIsListenerPortalOpen(true);
        }}
      />

      {/* Listener Portal Modal */}
      <ListenerDashboardModal
        isOpen={isListenerPortalOpen}
        user={user}
        stats={stats}
        onClose={() => setIsListenerPortalOpen(false)}
      />

      <IdentityModal
        isOpen={isIdentityOpen}
        user={user}
        onUpdateUser={handleUpdateUser}
        onClose={() => setIsIdentityOpen(false)}
      />

      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen && !isAndroidNativeApp}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Real-time 1-on-1 Text Message Session */}
      {activeSession && activeSession.mode === 'text' && (
        <LiveChatSession
          user={user}
          session={activeSession.session}
          peer={activeSession.peer}
          role={activeSession.role}
          onEndSession={() => setActiveSession(null)}
          onSwitchToCall={() => {
            setActiveSession({
              ...activeSession,
              mode: 'voice'
            });
          }}
          onOpenCrisis={() => setIsCrisisOpen(true)}
        />
      )}

      {/* Real-time 1-on-1 WebRTC Voice Call Session */}
      {activeSession && activeSession.mode === 'voice' && (
        <LiveCallSession
          user={user}
          session={activeSession.session}
          peer={activeSession.peer}
          role={activeSession.role}
          onEndCall={() => setActiveSession(null)}
          onSwitchToChat={() => {
            setActiveSession({
              ...activeSession,
              mode: 'text'
            });
          }}
        />
      )}

    </div>
  );
}
