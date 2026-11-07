/**
 * Storage and progress management for The Gateway
 */

export interface OrbData {
  id: string; // 'M', 'A1', 'N', 'A2', 'S'
  letter: string;
  title: string;
  subtitle: string;
  teaser: string;
  link: string;
  correctCode: string;
}

export const ORBS_CONFIG: OrbData[] = [
  {
    id: 'M',
    letter: 'M',
    title: 'The Mind Vault',
    subtitle: 'Architecture & Logic',
    teaser: 'A test of architecture, deep logic, and sharp intuition. Step into the vault to claim the cipher.',
    link: 'https://amarmani024-amg.github.io/M/',
    correctCode: 'MINDFORGE',
  },
  {
    id: 'A1',
    letter: 'A',
    title: 'AI Awakening',
    subtitle: 'Neural Intelligence',
    teaser: 'Where neural models converse, algorithms calibrate, and synthetic intellect sparks your next breakthrough.',
    link: 'https://amarmani024-amg.github.io/Manas-2/',
    correctCode: 'NEURALKING',
  },
  {
    id: 'N',
    letter: 'N',
    title: 'Navy Night Odyssey',
    subtitle: 'Deep Cosmos',
    teaser: 'A voyage across the midnight spectrum, charted only for the disciplined voyager with quiet focus.',
    link: 'https://amarmani024-amg.github.io/Manas-3/',
    correctCode: 'STARDUST',
  },
  {
    id: 'A2',
    letter: 'A',
    title: 'Adventure Arena',
    subtitle: 'Strategy & Resolve',
    teaser: 'High stakes, clean reflexes, and the tactical arena where champions prove their mastery.',
    link: 'https://amarmani024-amg.github.io/Manas-4/',
    correctCode: 'ARENAKING',
  },
  {
    id: 'S',
    letter: 'S',
    title: 'Surprise Mansion',
    subtitle: 'The Enigma',
    teaser: 'The grand enigmatic manor holds the final key before the celestial constellation aligns.',
    link: 'https://amarmani024-amg.github.io/Manas-5/',
    correctCode: 'SURPRISEKING',
  },
];

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const ALL_ACHIEVEMENTS: Record<string, Achievement> = {
  first_step: {
    id: 'first_step',
    title: 'First Step',
    desc: 'You ignited your first celestial star.',
    icon: '✨',
  },
  gate_opener: {
    id: 'gate_opener',
    title: 'Door Opener',
    desc: 'You decoded your first world cipher.',
    icon: '🚪',
  },
  code_breaker: {
    id: 'code_breaker',
    title: 'Code Breaker',
    desc: 'You unlocked 3 mystery worlds.',
    icon: '⚡',
  },
  master_key: {
    id: 'master_key',
    title: 'Master Key',
    desc: 'All five doors stand unlocked in gold.',
    icon: '🗝️',
  },
  constellation: {
    id: 'constellation',
    title: 'Constellation Architect',
    desc: 'The stars aligned and the final door opened.',
    icon: '🌌',
  },
  arcade_star: {
    id: 'arcade_star',
    title: 'Star Hunter',
    desc: 'Collected stardust in the cosmic arcade.',
    icon: '⭐',
  },
  memory_matrix: {
    id: 'memory_matrix',
    title: 'Memory Matrix',
    desc: 'Mastered the glowing memory sequence.',
    icon: '🧠',
  },
  secret_seeker: {
    id: 'secret_seeker',
    title: 'Curious Mind',
    desc: 'Discovered a hidden easter egg.',
    icon: '🔍',
  },
  easter_master: {
    id: 'easter_master',
    title: 'Protocol 42 Master',
    desc: 'Uncovered all 5 hidden anomalies.',
    icon: '👑',
  },
};

const STORAGE_KEY = 'the_gateway_save_v1';

export interface GatewayState {
  introCompleted: boolean;
  unlockedOrbs: string[]; // list of orb IDs: 'M', 'A1', etc.
  secretsFound: string[]; // 'starfield_10_taps', 'hello_terminal', 'konami_code', 'title_longpress', 'device_shake'
  achievements: string[];
  finalSecretSeen: boolean;
  arcadeHighScores: {
    starCatcher: number;
    memoryOrbs: number;
  };
}

const defaultState: GatewayState = {
  introCompleted: false,
  unlockedOrbs: [],
  secretsFound: [],
  achievements: [],
  finalSecretSeen: false,
  arcadeHighScores: {
    starCatcher: 0,
    memoryOrbs: 0,
  },
};

export function loadGatewayState(): GatewayState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveGatewayState(state: GatewayState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function resetGatewayState(): GatewayState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { ...defaultState };
}
