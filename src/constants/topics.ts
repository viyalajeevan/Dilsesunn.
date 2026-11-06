import { SupportTopic } from '../types/peerSupport';
import heroPeacefulImg from '../assets/images/hero_peaceful_sanctuary_1792226308483.jpg';
import topicHealthImg from '../assets/images/topic_health_restorative_1792226350361.jpg';
import topicIssuesImg from '../assets/images/topic_issues_clarity_1792226363827.jpg';
import topicLonelinessImg from '../assets/images/topic_loneliness_serene_1792226326142.jpg';
import topicFunImg from '../assets/images/topic_fun_uplifting_1792226381595.jpg';

export interface TopicMeta {
  id: SupportTopic;
  name: string;
  tagline: string;
  description: string;
  image: string;
  accentColor: string;
  badgeColor: string;
  starterPrompts: string[];
  callStarters: string[];
}

export const SUPPORT_TOPICS: Record<SupportTopic, TopicMeta> = {
  anything: {
    id: 'anything',
    name: 'Anything on my mind',
    tagline: 'Wide open, no specific topic required',
    description: 'Whatever thought, feeling, or weight is surfacing right now. Selecting this never reduces your chances of finding a kind listener.',
    image: heroPeacefulImg,
    accentColor: '#6366f1',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    starterPrompts: [
      'Just need a sounding board for what is going through my head.',
      'A lot of small things piling up all at once.',
      'Feeling an overwhelming mix of emotions today.',
      'Just wanting to connect with an empathetic human.'
    ],
    callStarters: [
      'Take your time. There is no right or wrong place to begin.',
      'What has been occupying your thoughts most today?',
      'I am completely open to whatever you would like to share.'
    ]
  },
  health: {
    id: 'health',
    name: 'Health, illness or uncertainty',
    tagline: 'Physical wellness, diagnoses, fatigue & emotional coping',
    description: 'Navigating medical news, cancer or chronic diagnosis, test anxiety, body changes, or the heavy emotional toll of caring for someone ill.',
    image: topicHealthImg,
    accentColor: '#059669',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    starterPrompts: [
      'Dealing with test anxiety while waiting for results.',
      'Feeling isolated with physical symptoms no one around me understands.',
      'The emotional burnout of managing a chronic condition.',
      'Needing a safe space to express medical fear without reassuring others.'
    ],
    callStarters: [
      'How has your energy felt today?',
      'Let us take a slow breath together before we dive in.',
      'You do not have to put on a brave face here.'
    ]
  },
  family: {
    id: 'family',
    name: 'Family and relationships',
    tagline: 'Boundaries, family friction, partnerships & communication',
    description: 'Navigating complicated relatives, parenting stress, relationship decisions, or boundary burnout without bias or unsolicited judgment.',
    image: topicIssuesImg,
    accentColor: '#d97706',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    starterPrompts: [
      'Feeling guilty for setting a boundary with family.',
      'Torn over a difficult relationship conversation I need to have.',
      'Feeling misunderstood by the people closest to me.',
      'Navigating expectations that do not match my reality.'
    ],
    callStarters: [
      'What is the hardest emotion coming up for you in this dynamic?',
      'If you could express your true feelings without fear of conflict, what would you say?',
      'I am here to listen with zero judgment about your family.'
    ]
  },
  work: {
    id: 'work',
    name: 'Work, finances or career',
    tagline: 'Burnout, financial knots, job cross-roads & imposter feelings',
    description: 'Workplace stress, dreading Mondays, making a frightening career pivot, or carrying the quiet weight of financial pressure.',
    image: topicIssuesImg,
    accentColor: '#0284c7',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
    starterPrompts: [
      'Work burnout has left me feeling empty.',
      'Carrying financial stress that I cannot talk about openly.',
      'Stuck between staying secure and leaping into the unknown.',
      'Dealing with a toxic work environment and loss of confidence.'
    ],
    callStarters: [
      'What part of work or money is feeling heaviest on your shoulders?',
      'It is okay to take off the work mask and just be human right now.',
      'Take all the time you need to vent.'
    ]
  },
  grief: {
    id: 'grief',
    name: 'Grief, loneliness or life changes',
    tagline: 'Late-night solitude, loss, moving cities & life transitions',
    description: 'When the world is quiet and you need a presence. Processing the loss of a loved one, ending a chapter, or moving to an unfamiliar place.',
    image: topicLonelinessImg,
    accentColor: '#6366f1',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    starterPrompts: [
      'The house feels too quiet tonight.',
      'Missing someone deeply and wanting to speak their memory into the room.',
      'Feeling like everyone has their tribe except me.',
      'Grieving a future that is not happening anymore.'
    ],
    callStarters: [
      'Grief and loneliness do not follow a timeline. I am right here with you.',
      'You do not have to explain yourself. Even sitting quietly together is welcome.',
      'What do you miss most right now?'
    ]
  },
  other: {
    id: 'other',
    name: 'Other',
    tagline: 'Unique circumstances, life quirks, or something else',
    description: 'Anything that does not fit neatly into a category. You are welcome here exactly as you are.',
    image: topicFunImg,
    accentColor: '#8b5cf6',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    starterPrompts: [
      'Something unique on my mind that is hard to label.',
      'Just needing a lighthearted conversation or wholesome distraction.',
      'Wanted to share a quirky thought with a stranger.',
      'Navigating a transition that feels completely foreign.'
    ],
    callStarters: [
      'Tell me whatever feels comfortable for you.',
      'I am here with an open mind and a kind shoulder.',
      'Ready whenever you are.'
    ]
  }
};

// Aliases and legacy mappings for backward compatibility
export const TOPICS: Record<string, TopicMeta> = {
  ...SUPPORT_TOPICS,
  loneliness: {
    id: 'grief' as SupportTopic,
    name: 'Loneliness & Solitude',
    tagline: 'When the world is quiet and you need a kind presence',
    description: 'Late night solitude, moving to a new city, or feeling like you carry life alone. Connect with peers ready to listen.',
    image: topicLonelinessImg,
    accentColor: '#6366f1',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    starterPrompts: [
      'The house feels too quiet tonight.',
      'Moved somewhere new and feeling isolated.',
      'Just need to hear another breathing human voice.',
      'Feeling disconnected even around other people.'
    ],
    callStarters: [
      'Take your time. Even sitting quietly together is welcome.',
      'I am here and listening with an open heart.',
      'How has your day felt?'
    ]
  },
  issues: {
    id: 'family' as SupportTopic,
    name: 'Life Issues & Hard Choices',
    tagline: 'Boundaries, family friction, career stress & dilemmas',
    description: 'Navigating complicated relationships, difficult career decisions, or family expectations without fear of judgment.',
    image: topicIssuesImg,
    accentColor: '#d97706',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    starterPrompts: [
      'Carrying a heavy decision I cannot tell anyone in my circle.',
      'Guilt over choosing my own path instead of family expectations.',
      'Feeling burnt out and trapped in a situation.',
      'Needing an unbiased sounding board for a personal crisis.'
    ],
    callStarters: [
      'What part of this is weighing most on your mind right now?',
      'There is no pressure to have it all figured out here.',
      'I am here with an open ear.'
    ]
  },
  fun: {
    id: 'other' as SupportTopic,
    name: 'Uplifting & Wholesome Distraction',
    tagline: 'Lighthearted stories, goofy relief & wholesome moments',
    description: 'When you had a draining day and just need low-stakes laughter, absurd anecdotes, or gentle wholesome human conversation.',
    image: topicFunImg,
    accentColor: '#8b5cf6',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    starterPrompts: [
      'Had an exhausting day, tell me a wholesome or funny story.',
      'Need a gentle, zero-stress distraction before sleep.',
      'Sharing a small win or ridiculous moment from today.',
      'Looking for comforting chatter and light laughs.'
    ],
    callStarters: [
      'Ready for some lighthearted cheer! How can I make you smile?',
      'What is something weird or silly that happened recently?',
      'Let us leave the heavy stuff behind for a moment.'
    ]
  }
};

