import { TopicCategory, ChatMessage, AnonymousUser } from '../types';

export interface PeerProfile {
  uniqueTag: string;
  alias: string;
  auraColor: string;
  role: 'sharer' | 'listener';
  bioNote: string;
}

export const PEER_POOL: Record<TopicCategory, PeerProfile[]> = {
  loneliness: [
    { uniqueTag: '#calm-wanderer-914', alias: 'Calm Wanderer', auraColor: '#6366f1', role: 'listener', bioNote: 'Night owl, quiet reader. Here to listen without interrupting.' },
    { uniqueTag: '#gentle-harbor-203', alias: 'Gentle Harbor', auraColor: '#8b5cf6', role: 'listener', bioNote: 'Knows what isolation feels like. Holding calm space.' },
    { uniqueTag: '#soft-sparrow-527', alias: 'Soft Sparrow', auraColor: '#0ea5e9', role: 'sharer', bioNote: 'Missing home and looking for gentle companionship.' }
  ],
  health: [
    { uniqueTag: '#resilient-cedar-318', alias: 'Resilient Cedar', auraColor: '#059669', role: 'listener', bioNote: 'Chronic illness warrior, slow-paced listener.' },
    { uniqueTag: '#peaceful-meadow-109', alias: 'Peaceful Meadow', auraColor: '#10b981', role: 'listener', bioNote: 'Mindful breathing enthusiast, non-judgmental presence.' },
    { uniqueTag: '#humble-clover-772', alias: 'Humble Clover', auraColor: '#0284c7', role: 'sharer', bioNote: 'Recovering from burnout, navigating daily fatigue.' }
  ],
  issues: [
    { uniqueTag: '#patient-beacon-641', alias: 'Patient Beacon', auraColor: '#d97706', role: 'listener', bioNote: 'Experienced in workplace dilemmas & family boundary tensions.' },
    { uniqueTag: '#quiet-willow-832', alias: 'Quiet Willow', auraColor: '#b45309', role: 'listener', bioNote: 'Here to help untangle big decisions at your own pace.' },
    { uniqueTag: '#warm-robin-415', alias: 'Warm Robin', auraColor: '#f59e0b', role: 'sharer', bioNote: 'Facing a major career crossroad, need an outside ear.' }
  ],
  fun: [
    { uniqueTag: '#mellow-lantern-388', alias: 'Mellow Lantern', auraColor: '#0284c7', role: 'listener', bioNote: 'Lover of silly trivia, indie gaming, and warm chuckles.' },
    { uniqueTag: '#tender-brook-506', alias: 'Tender Brook', auraColor: '#06b6d4', role: 'listener', bioNote: 'Ready for lighthearted distraction and wholesome banter.' },
    { uniqueTag: '#sunny-pebble-922', alias: 'Sunny Pebble', auraColor: '#38bdf8', role: 'sharer', bioNote: 'Need to get my mind off a rough day with some fun chat.' }
  ]
};

// Realistic empathetic response bank for peer conversation
export const EMPATHETIC_RESPONSES: Record<TopicCategory, string[]> = {
  loneliness: [
    "I hear you so clearly. You don't have to carry that silence alone right now.",
    "Thank you for sharing that with me. It takes courage to admit feeling lonely.",
    "I'm right here with you. What feels like the hardest time of day for you?",
    "Sometimes just knowing someone is on the other end of the screen helps take the edge off the quiet.",
    "Take all the time you need. No rush at all to reply.",
    "Sending you a warm quiet hug across the wire. You exist, and your presence matters."
  ],
  health: [
    "I'm so sorry your body is putting you through this right now.",
    "Health uncertainties take such an invisible mental toll. How are you holding up emotionally?",
    "Please give yourself permission to just rest today without measuring productivity.",
    "It’s okay to feel frustrated and tired. Your feelings are completely valid.",
    "Taking a slow, grounding breath with you right now.",
    "Remember you are doing the absolute best you can with the energy you have today."
  ],
  issues: [
    "That is such a heavy dilemma. It makes complete sense why you feel stuck.",
    "When you imagine stepping away from that pressure, what is the very first feeling that comes up?",
    "You have been carrying this responsibility for a long time. It’s okay to put the weight down for a moment.",
    "No judgment whatsoever here. You deserve to protect your own peace.",
    "Take a breath. What would feel like the kindest choice for yourself, even if it's uncomfortable for others?",
    "I’m listening closely. Tell me more if you'd like to get it all off your chest."
  ],
  fun: [
    "Haha, that is wonderful! We definitely need more lighthearted moments like that.",
    "Oh that reminds me of an absurd story—life can be wonderfully strange sometimes!",
    "That made me smile right as I read it. What's another thing that brings you comfort?",
    "I love that! Honestly, zero-stakes conversations like this are the best antidote to stress.",
    "Tell me more! I'm all ears for wholesome distractions today."
  ]
};

export class RealtimePeerService {
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: ((msg: ChatMessage) => void) | null = null;
  private onPeerTypingCallback: ((isTyping: boolean) => void) | null = null;
  private onCallStateCallback: ((data: unknown) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('kind_shoulder_live_bus');
        this.channel.onmessage = (event) => {
          this.handleIncoming(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted', e);
      }
    }
  }

  private handleIncoming(data: { type: string; payload: unknown }) {
    if (data.type === 'CHAT_MESSAGE' && this.onMessageCallback) {
      this.onMessageCallback(data.payload as ChatMessage);
    } else if (data.type === 'PEER_TYPING' && this.onPeerTypingCallback) {
      this.onPeerTypingCallback((data.payload as { isTyping: boolean }).isTyping);
    } else if (data.type === 'CALL_EVENT' && this.onCallStateCallback) {
      this.onCallStateCallback(data.payload);
    }
  }

  public registerChatCallbacks(
    onMsg: (msg: ChatMessage) => void,
    onTyping: (isTyping: boolean) => void
  ) {
    this.onMessageCallback = onMsg;
    this.onPeerTypingCallback = onTyping;
  }

  public registerCallCallback(onCall: (data: unknown) => void) {
    this.onCallStateCallback = onCall;
  }

  public broadcastMessage(msg: ChatMessage) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'CHAT_MESSAGE',
        payload: { ...msg, isSelf: false }
      });
    }
  }

  public broadcastTyping(isTyping: boolean) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_TYPING',
        payload: { isTyping }
      });
    }
  }

  public broadcastCallEvent(event: string, payload: unknown) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'CALL_EVENT',
        payload: { event, payload }
      });
    }
  }

  // Simulate an empathetic peer response after user sends message
  public scheduleSimulatedReply(
    topic: TopicCategory,
    peer: PeerProfile,
    userText: string,
    onSend: (msg: ChatMessage) => void,
    onTypingChange: (typing: boolean) => void
  ) {
    // Show typing after 700ms
    const typingTimer = setTimeout(() => {
      onTypingChange(true);
    }, 600);

    // Pick response
    const pool = EMPATHETIC_RESPONSES[topic] || EMPATHETIC_RESPONSES.loneliness;
    const responseText = pool[Math.floor(Math.random() * pool.length)];

    // Deliver response after 2.2 - 3.4 seconds (realistic empathetic human cadence)
    const deliverDelay = 2200 + Math.random() * 1200;
    const deliverTimer = setTimeout(() => {
      onTypingChange(false);
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderTag: peer.uniqueTag,
        isSelf: false,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onSend(newMsg);
    }, deliverDelay);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(deliverTimer);
      onTypingChange(false);
    };
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.onMessageCallback = null;
    this.onPeerTypingCallback = null;
    this.onCallStateCallback = null;
  }
}

export const realtimeService = new RealtimePeerService();
