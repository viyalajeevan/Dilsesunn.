import {
  MatchRequest,
  UserEligibilityProfile,
  SupportPreference,
  SupportTopic,
  CommunicationPreference
} from '../src/types/peerSupport';

export interface ScoredCandidate {
  listener: UserEligibilityProfile;
  totalScore: number;
  breakdown: {
    styleScore: number;
    topicScore: number;
    modeScore: number;
    loadBalancingScore: number;
  };
}

export class MatchingEngine {
  private blocks: Map<string, Set<string>> = new Map();

  public addBlock(userId: string, blockedUserId: string) {
    if (!this.blocks.has(userId)) {
      this.blocks.set(userId, new Set());
    }
    this.blocks.get(userId)!.add(blockedUserId);
  }

  public isBlocked(userA: string, userB: string): boolean {
    const aBlocks = this.blocks.get(userA);
    if (aBlocks && aBlocks.has(userB)) return true;
    const bBlocks = this.blocks.get(userB);
    if (bBlocks && bBlocks.has(userA)) return true;
    return false;
  }

  /**
   * Stage A: Eligibility checks
   * Safety and eligibility rules must ALWAYS take precedence over compatibility scores.
   */
  public checkEligibility(
    request: MatchRequest,
    listener: UserEligibilityProfile,
    isSocketConnected: boolean
  ): { eligible: boolean; reason?: string } {
    // 1. Must not be the same user
    if (listener.userId === request.requesterId) {
      return { eligible: false, reason: 'self' };
    }

    // 2. Genuinely online with active socket
    if (!isSocketConnected) {
      return { eligible: false, reason: 'offline' };
    }

    // 3. Explicitly opted in and available
    if (!listener.isAvailableAsListener) {
      return { eligible: false, reason: 'unavailable' };
    }

    // 4. Ineligible/Suspended check
    if (listener.isSuspended) {
      return { eligible: false, reason: 'suspended' };
    }

    // 5. Must meet age policy
    if (!listener.isAgeConfirmed) {
      return { eligible: false, reason: 'age_unconfirmed' };
    }

    // 6. Must not already have an active session
    if (listener.activeSessionId !== null) {
      return { eligible: false, reason: 'busy_in_session' };
    }

    // 7. No block or exclusion relationship
    if (this.isBlocked(request.requesterId, listener.userId)) {
      return { eligible: false, reason: 'blocked' };
    }

    // 8. CRITICAL: Support style eligibility
    // A listener who has not agreed to listening without advice must never be matched
    // with a user who specifically requests no advice.
    if (!listener.acceptedSupportStyles.includes(request.supportPreference)) {
      return { eligible: false, reason: 'unsupported_style' };
    }

    // 9. Communication mode eligibility
    if (request.communicationMode === 'text' && !listener.acceptedCommunicationModes.includes('text')) {
      return { eligible: false, reason: 'unsupported_mode' };
    }
    if (request.communicationMode === 'voice' && !listener.acceptedCommunicationModes.includes('voice')) {
      return { eligible: false, reason: 'unsupported_mode' };
    }
    if (request.communicationMode === 'either') {
      const canDoEither = listener.acceptedCommunicationModes.includes('text') || listener.acceptedCommunicationModes.includes('voice');
      if (!canDoEither) {
        return { eligible: false, reason: 'unsupported_mode' };
      }
    }

    // Passed all Stage A rules
    return { eligible: true };
  }

  /**
   * Stage B: Compatibility Scoring
   * Weights:
   * - Support style match: 40 pts
   * - Topic / lived experience match: 30 pts (universal credit if "anything" is selected)
   * - Communication mode match: 15 pts
   * - Fair load balancing / wait time: 15 pts
   */
  public scoreCandidate(
    request: MatchRequest,
    listener: UserEligibilityProfile,
    currentTime: number
  ): ScoredCandidate {
    // 1. Style Score (Max 40)
    let styleScore = 30;
    if (listener.acceptedSupportStyles[0] === request.supportPreference) {
      styleScore = 40; // Primary preferred style
    }

    // 2. Topic Score (Max 30)
    // Rule: Choosing "Anything on my mind" must NOT reduce user's chances.
    let topicScore = 20;
    if (request.topic === 'anything') {
      topicScore = 30; // Full credit for open topic
    } else if (listener.acceptedTopics.includes(request.topic)) {
      topicScore = 30; // Direct topic match
    } else if (listener.acceptedTopics.includes('anything')) {
      topicScore = 25; // Listener accepts all topics
    }

    // 3. Mode Score (Max 15)
    let modeScore = 15;
    if (request.communicationMode !== 'either' && !listener.acceptedCommunicationModes.includes(request.communicationMode)) {
      modeScore = 0;
    }

    // 4. Load Balancing / Recency Score (Max 15)
    // Prevents listener burnout: listeners who haven't had a session recently or have fewer completed sessions get priority.
    let loadBalancingScore = 10;
    if (listener.lastActiveSessionEndedAt) {
      const minutesSinceLast = (currentTime - listener.lastActiveSessionEndedAt) / (1000 * 60);
      if (minutesSinceLast > 30) loadBalancingScore = 15;
      else if (minutesSinceLast > 10) loadBalancingScore = 12;
      else loadBalancingScore = 8;
    } else {
      // Never had a session or waiting fresh
      loadBalancingScore = 15;
    }

    const totalScore = styleScore + topicScore + modeScore + loadBalancingScore;

    return {
      listener,
      totalScore,
      breakdown: {
        styleScore,
        topicScore,
        modeScore,
        loadBalancingScore
      }
    };
  }

  /**
   * Find best match among all candidates
   */
  public findBestMatch(
    request: MatchRequest,
    allListeners: UserEligibilityProfile[],
    isSocketConnectedMap: (userId: string) => boolean
  ): ScoredCandidate | null {
    const currentTime = Date.now();
    const eligibleCandidates: ScoredCandidate[] = [];

    for (const listener of allListeners) {
      const isConnected = isSocketConnectedMap(listener.userId);
      const eligibility = this.checkEligibility(request, listener, isConnected);
      if (eligibility.eligible) {
        const scored = this.scoreCandidate(request, listener, currentTime);
        eligibleCandidates.push(scored);
      }
    }

    if (eligibleCandidates.length === 0) {
      return null;
    }

    // Sort descending by total score
    eligibleCandidates.sort((a, b) => b.totalScore - a.totalScore);

    return eligibleCandidates[0];
  }
}
