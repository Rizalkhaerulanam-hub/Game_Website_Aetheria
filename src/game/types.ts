export type BiomeId = 'verdant' | 'crystal' | 'sunken' | 'sky' | 'volcanic';

export interface BiomeInfo {
  id: BiomeId;
  name: string;
  subtitle: string;
  color: string;
  accent: string;
  bgRgb: string;
  description: string;
  totalPuzzles: number;
}

export type PuzzleType = 'mirror_beam' | 'megalith_plates' | 'harmonic_sequence';

export interface MirrorCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'emitter' | 'receiver' | 'mirror' | 'prism';
  direction?: 'north' | 'east' | 'south' | 'west'; // emitter or receiver facing direction
  mirrorAngle?: '/' | '\\'; // rotation of mirror
  active?: boolean;
}

export interface MegalithCell {
  x: number;
  y: number;
  type: 'floor' | 'wall' | 'plate' | 'stone' | 'stone_on_plate';
  plateColor?: string;
}

export interface HarmonicRune {
  id: string;
  symbol: string;
  name: string;
  frequency: number;
  color: string;
}

export interface ShrinePuzzleData {
  id: string;
  biomeId: BiomeId;
  name: string;
  lore: string;
  type: PuzzleType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  rewardRelic: string;
  rewardExp: number;
  // Specific data depending on type
  mirrorGrid?: {
    cols: number;
    rows: number;
    cells: MirrorCell[];
  };
  megalithGrid?: {
    cols: number;
    rows: number;
    cells: MegalithCell[];
  };
  harmonicSequence?: {
    runes: HarmonicRune[];
    targetSequence: string[];
  };
}

export interface PlayerInventoryItem {
  id: string;
  name: string;
  type: 'relic' | 'charm' | 'crystal' | 'compass' | 'key';
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  count: number;
}

export interface PlayerStats {
  stepsTaken: number;
  puzzlesSolved: number;
  relicsDiscovered: number;
  totalPlayTimeSec: number;
  adImpressionsWatched: number;
  rewardedBonusPoints: number;
  dailyStreak: number;
  lastDailyDate: string;
  shrineSolvesByType: Record<PuzzleType, number>;
  biomeExplorationPct: Record<BiomeId, number>;
}

export interface PlayerSaveData {
  version: number;
  playerId: string;
  playerName: string;
  playerLevel: number;
  relicScore: number;
  staminaMax: number;
  currentBiome: BiomeId;
  playerX: number;
  playerY: number;
  solvedPuzzleIds: string[];
  collectedChestIds: string[];
  inventory: PlayerInventoryItem[];
  stats: PlayerStats;
  settings: {
    theme: 'dark' | 'emerald' | 'cyber' | 'contrast';
    soundMuted: boolean;
    soundVolume: number;
    accessibleColors: boolean;
    largeFont: boolean;
    highContrast: boolean;
    pushNotificationEnabled: boolean;
    dailyReminderTime: string; // "19:00"
    googleAdSenseClientId: string; // e.g. "ca-pub-XXXXXXXXXX"
    googleAdSlotId: string;
  };
  updatedAt: number;
}

export interface LeaderboardEntry {
  rank?: number;
  playerId: string;
  playerName: string;
  score: number;
  level: number;
  puzzlesSolved: number;
  relicsFound: number;
  currentBiome: BiomeId;
  updatedAt: number;
}

export interface AnalyticsEvent {
  eventType: 'puzzle_solved' | 'biome_entered' | 'ad_watched' | 'chest_opened' | 'offline_sync';
  timestamp: number;
  details?: Record<string, any>;
}
