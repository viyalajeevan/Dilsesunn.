export type TopicCategory = 'fun' | 'health' | 'issues' | 'loneliness';

export type CommunicationMode = 'message' | 'call' | 'both';

export type SupportRole = 'sharer' | 'listener' | 'open';

export interface AnonymousUser {
  id: string; // e.g. "usr_9482"
  uniqueTag: string; // e.g. "#kind-otter-482"
  alias: string; // e.g. "Kind Otter"
  auraColor: string; // hex or tailwind tone
  auraGradient: string;
  supportRole: SupportRole;
  joinedDate: string;
  karmaHugsReceived: number;
  listenedCount: number;
}

export interface PostReaction {
  type: 'hear_you' | 'warm_hug' | 'strength' | 'breathe';
  count: number;
  userReacted?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorTag: string;
  authorAura: string;
  content: string;
  createdAt: string;
  isHelpfulVoteCount: number;
  userVoted?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: TopicCategory;
  authorTag: string;
  authorAura: string;
  createdAt: string;
  supportType: 'vent_only' | 'advice_welcome' | 'similar_stories' | 'open_to_call';
  reactions: {
    hear_you: number;
    warm_hug: number;
    strength: number;
    breathe: number;
  };
  comments: Comment[];
  allowDirectCall: boolean;
  allowDirectMessage: boolean;
  status: 'open' | 'resolved' | 'comforted';
}

export interface ChatMessage {
  id: string;
  senderTag: string;
  isSelf: boolean;
  text: string;
  timestamp: string;
  isPromptAnswer?: boolean;
}

export interface PeerSession {
  sessionId: string;
  mode: 'message' | 'call';
  topic: TopicCategory;
  peerTag: string;
  peerAura: string;
  peerRole: 'sharer' | 'listener';
  connectedAt: number;
  status: 'waiting' | 'connected' | 'ended';
}
