import {
  MatchRequest,
  SupportPreference,
  SupportTopic,
  CommunicationPreference,
  MatchingStats,
  ActiveSession,
  RealtimeMessage
} from '../types/peerSupport';
import { AnonymousUser } from '../types';

type MessageListener = (data: { type: string; payload: any }) => void;

class BackendSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<MessageListener> = new Set();
  private currentUser: AnonymousUser | null = null;
  private isAgeConfirmed: boolean = true;
  private reconnectTimeout: any = null;
  private isIntentionalClose: boolean = false;
  private stats: MatchingStats = {
    onlineUsersCount: 1,
    availableListenersCount: 0,
    activeSessionsCount: 0,
    queueLength: 0
  };

  public init(user: AnonymousUser, isAgeConfirmed: boolean = true) {
    this.currentUser = user;
    this.isAgeConfirmed = isAgeConfirmed;
    this.connect();
  }

  public updateProfile(user: AnonymousUser, isAgeConfirmed: boolean = true) {
    this.currentUser = user;
    this.isAgeConfirmed = isAgeConfirmed;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({
        type: 'INIT_PROFILE',
        payload: {
          userId: user.id,
          uniqueTag: user.uniqueTag,
          alias: user.alias,
          auraColor: user.auraColor,
          isAgeConfirmed,
          isAvailableAsListener: user.supportRole === 'listener' || user.supportRole === 'open'
        }
      });
    }
  }

  private connect() {
    if (!this.currentUser) return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        if (!this.currentUser) return;
        this.send({
          type: 'INIT_PROFILE',
          payload: {
            userId: this.currentUser.id,
            uniqueTag: this.currentUser.uniqueTag,
            alias: this.currentUser.alias,
            auraColor: this.currentUser.auraColor,
            isAgeConfirmed: this.isAgeConfirmed,
            isAvailableAsListener: this.currentUser.supportRole === 'listener' || this.currentUser.supportRole === 'open'
          }
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'STATS_UPDATE') {
            this.stats = parsed.payload;
          }
          this.notifyListeners(parsed);
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      this.socket.onclose = () => {
        if (!this.isIntentionalClose) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, 3000);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('Backend WebSocket encountered an event:', err);
      };
    } catch (e) {
      console.warn('Could not establish WebSocket connection:', e);
    }
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(data: { type: string; payload: any }) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in socket listener:', err);
      }
    }
  }

  public send(data: { type: string; payload?: any }) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public getStats(): MatchingStats {
    return this.stats;
  }

  public requestMatch(params: {
    supportPreference: SupportPreference;
    topic: SupportTopic;
    communicationMode: CommunicationPreference;
  }) {
    if (!this.currentUser) return;
    this.send({
      type: 'REQUEST_MATCH',
      payload: {
        requesterTag: this.currentUser.uniqueTag,
        requesterAura: this.currentUser.auraColor,
        supportPreference: params.supportPreference,
        topic: params.topic,
        communicationMode: params.communicationMode
      }
    });
  }

  public cancelMatchRequest() {
    this.send({ type: 'CANCEL_MATCH_REQUEST' });
  }

  public setListenerAvailability(
    isAvailable: boolean,
    acceptedSupportStyles?: SupportPreference[],
    acceptedTopics?: SupportTopic[],
    acceptedCommunicationModes?: ('text' | 'voice')[]
  ) {
    this.send({
      type: 'UPDATE_LISTENER_AVAILABILITY',
      payload: {
        isAvailable,
        acceptedSupportStyles,
        acceptedTopics,
        acceptedCommunicationModes
      }
    });
  }

  public sendChatMessage(text: string) {
    if (!this.currentUser) return;
    this.send({
      type: 'CHAT_MESSAGE',
      payload: {
        senderTag: this.currentUser.uniqueTag,
        text
      }
    });
  }

  public sendTyping(isTyping: boolean) {
    this.send({
      type: 'TYPING_INDICATOR',
      payload: { isTyping }
    });
  }

  public sendWebRtcSignal(signal: any) {
    this.send({
      type: 'WEBRTC_SIGNAL',
      payload: signal
    });
  }

  public endSession() {
    this.send({ type: 'END_SESSION' });
  }

  public reportAndBlock(reportedUserId: string, reason: string) {
    this.send({
      type: 'REPORT_AND_BLOCK',
      payload: { reportedUserId, reason }
    });
  }

  public destroy() {
    this.isIntentionalClose = true;
    clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const backendSocket = new BackendSocketService();
