import { AnonymousUser } from '../types';

const ADJECTIVES = [
  'Kind', 'Calm', 'Gentle', 'Quiet', 'Patient', 'Serene', 'Warm', 'Humble',
  'Tender', 'Resilient', 'Thoughtful', 'Caring', 'Peaceful', 'Steadfast',
  'Mellow', 'Soft', 'Earnest', 'Hopeful', 'Sincere', 'Graceful'
];

const NOUNS = [
  'Otter', 'Wanderer', 'Harbor', 'Star', 'Pine', 'River', 'Sparrow', 'Willow',
  'Lantern', 'Meadow', 'Horizon', 'Breeze', 'Canyon', 'Cedar', 'Pebble',
  'Beacon', 'Haven', 'Brook', 'Clover', 'Robin'
];

const AURA_PALETTES = [
  { name: 'Indigo Dusk', hex: '#6366f1', gradient: 'from-indigo-500 to-slate-800' },
  { name: 'Sage Haven', hex: '#10b981', gradient: 'from-emerald-500 to-teal-800' },
  { name: 'Amber Hearth', hex: '#f59e0b', gradient: 'from-amber-500 to-orange-800' },
  { name: 'Sky Calm', hex: '#0ea5e9', gradient: 'from-sky-500 to-blue-800' },
  { name: 'Rose Solace', hex: '#f43f5e', gradient: 'from-rose-400 to-pink-800' },
  { name: 'Violet Peace', hex: '#8b5cf6', gradient: 'from-purple-500 to-indigo-900' }
];

export function generateAnonymousIdentity(): AnonymousUser {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const alias = `${adj} ${noun}`;
  const uniqueTag = `#${adj.toLowerCase()}-${noun.toLowerCase()}-${num}`;
  const aura = AURA_PALETTES[Math.floor(Math.random() * AURA_PALETTES.length)];

  return {
    id: `usr_${Date.now()}_${num}`,
    uniqueTag,
    alias,
    auraColor: aura.hex,
    auraGradient: aura.gradient,
    supportRole: 'open',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    karmaHugsReceived: 3,
    listenedCount: 2
  };
}

const STORAGE_KEY = 'kind_shoulder_anonymous_user';

export function getStoredUser(): AnonymousUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.uniqueTag && parsed.alias && parsed.auraColor) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read user from storage', e);
  }
  const newUser = generateAnonymousIdentity();
  saveStoredUser(newUser);
  return newUser;
}

export function saveStoredUser(user: AnonymousUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Could not save user to storage', e);
  }
}
