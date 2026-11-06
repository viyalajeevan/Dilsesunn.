import { Post } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_loneliness_1',
    category: 'loneliness',
    title: 'Moved to a new city 4 months ago. The silence at 9 PM hits harder than I thought.',
    content: 'I thought I was completely fine being independent, but tonight I ate dinner staring at the wall and realized I haven’t had a real, unplanned conversation in two weeks. It feels silly to admit out loud because on paper my life is fine. Just feeling like a ghost passing through crowded streets.',
    authorTag: '#quiet-harbor-612',
    authorAura: '#6366f1',
    createdAt: '22 minutes ago',
    supportType: 'advice_welcome',
    reactions: {
      hear_you: 18,
      warm_hug: 24,
      strength: 12,
      breathe: 9
    },
    comments: [
      {
        id: 'c_1',
        postId: 'post_loneliness_1',
        authorTag: '#tender-sparrow-481',
        authorAura: '#10b981',
        content: 'That 9 PM threshold is so real. Your nervous system is adjusting to a brand new environment. You are not a ghost, you’re just in the quiet in-between season. Sending you warmth from another quiet apartment.',
        createdAt: '15 minutes ago',
        isHelpfulVoteCount: 9,
        userVoted: false
      },
      {
        id: 'c_2',
        postId: 'post_loneliness_1',
        authorTag: '#gentle-pine-305',
        authorAura: '#f59e0b',
        content: 'If you ever want to connect on a voice call here just to have human background chatter while making tea, let me know. Sometimes simply hearing another breathing human helps ground you.',
        createdAt: '8 minutes ago',
        isHelpfulVoteCount: 6,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  },
  {
    id: 'post_health_1',
    category: 'health',
    title: 'Waiting on biopsy results until Tuesday. Trying not to spiral every 10 minutes.',
    content: 'The doctor said "it’s most likely benign routine caution", but my brain keeps jumping to the absolute worst-case scenarios. I can’t focus on work, I feel guilty burdening my partner who is already stressed, and every minor ache feels magnified.',
    authorTag: '#resilient-clover-194',
    authorAura: '#059669',
    createdAt: '1 hour ago',
    supportType: 'vent_only',
    reactions: {
      hear_you: 35,
      warm_hug: 47,
      strength: 28,
      breathe: 22
    },
    comments: [
      {
        id: 'c_3',
        postId: 'post_health_1',
        authorTag: '#calm-beacon-719',
        authorAura: '#0ea5e9',
        content: 'Medical limbo is pure psychological warfare. It is completely normal that your brain is cataloging worst-case scenarios—it’s trying to protect you. Take things 30 minutes at a time. We are right here with you until Tuesday.',
        createdAt: '42 minutes ago',
        isHelpfulVoteCount: 14,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  },
  {
    id: 'post_issues_1',
    category: 'issues',
    title: 'I need to resign from my family’s business, but the guilt is suffocating.',
    content: 'My father started the company 30 years ago. I’ve worked there for 8 years. It has completely eroded my passion, mental peace, and marriage. Every time I prepare to have the talk, I picture the disappointment in his eyes and freeze up. I feel like an ungrateful child even though I am 34.',
    authorTag: '#steadfast-brook-823',
    authorAura: '#d97706',
    createdAt: '3 hours ago',
    supportType: 'advice_welcome',
    reactions: {
      hear_you: 29,
      warm_hug: 19,
      strength: 31,
      breathe: 8
    },
    comments: [
      {
        id: 'c_4',
        postId: 'post_issues_1',
        authorTag: '#quiet-cedar-944',
        authorAura: '#8b5cf6',
        content: 'You gave 8 whole years of your youth to his dream. Honoring your parents doesn’t mean martyring your own life. Disappointment is a temporary emotion he will survive; a destroyed marriage or mental breakdown is not. You have permission to step out.',
        createdAt: '2 hours ago',
        isHelpfulVoteCount: 19,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  },
  {
    id: 'post_fun_1',
    category: 'fun',
    title: 'Horrible day at work, please tell me your most wholesome or absurd funny story.',
    content: 'Today was an absolute dumpster fire of meetings that could have been emails and coffee spills on white shirts. I just need ridiculous, zero-stakes, funny stranger stories to laugh before sleeping. Any absurd childhood memories or pet fails welcome!',
    authorTag: '#mellow-robin-551',
    authorAura: '#0284c7',
    createdAt: '4 hours ago',
    supportType: 'similar_stories',
    reactions: {
      hear_you: 22,
      warm_hug: 16,
      strength: 14,
      breathe: 5
    },
    comments: [
      {
        id: 'c_5',
        postId: 'post_fun_1',
        authorTag: '#sincere-lantern-239',
        authorAura: '#f43f5e',
        content: 'Last week my cat watched me struggle to assemble an IKEA stool for 2 hours. The second I put the final screw in, he hopped on it, looked me dead in the eye, and knocked the instructions off the table like a judge giving a 3/10.',
        createdAt: '3 hours ago',
        isHelpfulVoteCount: 27,
        userVoted: false
      },
      {
        id: 'c_6',
        postId: 'post_fun_1',
        authorTag: '#hopeful-willow-602',
        authorAura: '#10b981',
        content: 'When I was 7, I was convinced if I swallowed watermelon seeds a vine would sprout out my ears, so I wore earmuffs in 90-degree July weather for 3 days straight to "choke the plant".',
        createdAt: '2 hours ago',
        isHelpfulVoteCount: 21,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  },
  {
    id: 'post_loneliness_2',
    category: 'loneliness',
    title: 'Watching old family videos alone on a Friday night.',
    content: 'Lost my grandmother last winter. She was the one person who always picked up the phone no matter the hour. Tonight I just miss that gentle "hello my dear" so much my chest aches. If anyone is up and feeling a similar void, you’re not alone.',
    authorTag: '#tender-meadow-730',
    authorAura: '#6366f1',
    createdAt: '5 hours ago',
    supportType: 'vent_only',
    reactions: {
      hear_you: 41,
      warm_hug: 62,
      strength: 34,
      breathe: 29
    },
    comments: [
      {
        id: 'c_7',
        postId: 'post_loneliness_2',
        authorTag: '#peaceful-star-112',
        authorAura: '#f59e0b',
        content: 'Grandmothers leave such a distinct silence behind. Her love didn’t disappear with her physical presence—it is echoing through the fact that you still cherish her memory tonight. Holding space for your grief.',
        createdAt: '4 hours ago',
        isHelpfulVoteCount: 31,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  },
  {
    id: 'post_health_2',
    category: 'health',
    title: 'Day 12 of insomnia. The world feels strange and blurry.',
    content: 'My sleep schedule broke down completely after a high-stress project. Every night I lie in the dark watching the ceiling fan spin, heart thumping. Any gentle advice on calming the sleep anxiety cycle without sleeping pills?',
    authorTag: '#soft-horizon-404',
    authorAura: '#059669',
    createdAt: '6 hours ago',
    supportType: 'advice_welcome',
    reactions: {
      hear_you: 19,
      warm_hug: 23,
      strength: 15,
      breathe: 18
    },
    comments: [
      {
        id: 'c_8',
        postId: 'post_health_2',
        authorTag: '#patient-canyon-881',
        authorAura: '#0ea5e9',
        content: 'The trick that helped my insomnia was paradoxical intention: giving yourself permission NOT to sleep. Tell yourself: "I am just resting my eyes and resting my muscles. Even lying still is restful." It takes the performance pressure off.',
        createdAt: '5 hours ago',
        isHelpfulVoteCount: 16,
        userVoted: false
      }
    ],
    allowDirectCall: true,
    allowDirectMessage: true,
    status: 'open'
  }
];
