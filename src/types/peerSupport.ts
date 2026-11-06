export type SupportPreference =
  | 'listen_without_advice'
  | 'different_perspective'
  | 'similar_experience'
  | 'keep_company'
  | 'lighthearted';

export type SupportTopic =
  | 'anything'
  | 'health'
  | 'family'
  | 'work'
  | 'grief'
  | 'other';

export type CommunicationPreference = 'text' | 'voice' | 'either';

export interface UserEligibilityProfile {
  userId: string;
  uniqueTag: string;
  alias: string;
  auraColor: string;
  isAgeConfirmed: boolean;
  isSuspended: boolean;
  isAvailableAsListener: boolean;
  acceptedSupportStyles: SupportPreference[];
  acceptedTopics: SupportTopic[];
  acceptedCommunicationModes: ('text' | 'voice')[];
  activeSessionId: string | null;
  lastActiveSessionEndedAt: number | null;
  totalSessionsCompleted: number;
}

export interface MatchRequest {
  requestId: string;
  requesterId: string;
  requesterTag: string;
  requesterAura: string;
  supportPreference: SupportPreference;
  topic: SupportTopic;
  communicationMode: CommunicationPreference;
  createdAt: number;
}

export interface ActiveSession {
  sessionId: string;
  requesterId: string;
  requesterTag: string;
  requesterAura: string;
  listenerId: string;
  listenerTag: string;
  listenerAura: string;
  supportPreference: SupportPreference;
  topic: SupportTopic;
  communicationMode: 'text' | 'voice';
  status: 'active' | 'ended';
  startedAt: number;
  endedAt: number | null;
}

export interface RealtimeMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderTag: string;
  text: string;
  timestamp: number;
}

export interface MatchingStats {
  onlineUsersCount: number;
  availableListenersCount: number;
  activeSessionsCount: number;
  queueLength: number;
}
