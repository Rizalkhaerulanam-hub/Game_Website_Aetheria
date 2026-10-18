import type { BiomeId, BiomeInfo, ShrinePuzzleData, PlayerInventoryItem } from './types.ts';

export const BIOMES: Record<BiomeId, BiomeInfo> = {
  verdant: {
    id: 'verdant',
    name: 'Suaka Zamrud (Verdant Sanctuary)',
    subtitle: 'Hutan Kuno & Kuil Lumut',
    color: '#10b981',
    accent: '#34d399',
    bgRgb: '16, 185, 129',
    description: 'Hutan lebat bertabur reruntuhan peradaban kuno yang tenang dengan gemersik daun dan kristal lumut penyembuh.',
    totalPuzzles: 4,
  },
  crystal: {
    id: 'crystal',
    name: 'Gua Kristal (Crystal Caverns)',
    subtitle: 'Lorong Prismatik & Pantulan Cahaya',
    color: '#06b6d4',
    accent: '#67e8f9',
    bgRgb: '6, 182, 212',
    description: 'Gua bawah tanah berkilauan dengan stalaktit kuarsa yang membiaskan berkas cahaya laser purba.',
    totalPuzzles: 4,
  },
  sunken: {
    id: 'sunken',
    name: 'Atol Tenggelam (Sunken Atoll)',
    subtitle: 'Reruntuhan Samudra & Aliran Air',
    color: '#3b82f6',
    accent: '#60a5fa',
    bgRgb: '59, 130, 246',
    description: 'Kepulauan mistis dengan pilar marmer setengah terendam tempat arus air purba menyembunyikan rahasia.',
    totalPuzzles: 4,
  },
  sky: {
    id: 'sky',
    name: 'Benteng Angkasa (Sky Citadel)',
    subtitle: 'Pulau Melayang & Genta Harmoni',
    color: '#a855f7',
    accent: '#c084fc',
    bgRgb: '168, 85, 247',
    description: 'Pulau-pulau batu melayang di atas awan yang terhubung oleh jembatan energi dan genta suara astral.',
    totalPuzzles: 4,
  },
  volcanic: {
    id: 'volcanic',
    name: 'Kawah Obsidian (Volcanic Forge)',
    subtitle: 'Batu Lahar & Gerbang Api',
    color: '#f97316',
    accent: '#fb923c',
    bgRgb: '249, 115, 22',
    description: 'Lembah lava membara dengan lempeng obsidian tebal dan tempaan rune energi primordial.',
    totalPuzzles: 4,
  },
};

export const SHRINE_PUZZLES: ShrinePuzzleData[] = [
  // Verdant Sanctuary Puzzles
  {
    id: 'shrine_v1',
    biomeId: 'verdant',
    name: 'Kuil Penyelaras Sinar Zamrud',
    lore: 'Arahkan cahaya fajar menembus cermin prismatik untuk membangunkan benih raksasa pohon kehidupan.',
    type: 'mirror_beam',
    difficulty: 1,
    rewardRelic: 'Benih Cahaya Abadi',
    rewardExp: 500,
    mirrorGrid: {
      cols: 4,
      rows: 4,
      cells: [
        { x: 0, y: 1, type: 'emitter', direction: 'east' },
        { x: 2, y: 1, type: 'mirror', mirrorAngle: '\\' },
        { x: 2, y: 3, type: 'mirror', mirrorAngle: '/' },
        { x: 3, y: 3, type: 'receiver', direction: 'west' },
      ],
    },
  },
  {
    id: 'shrine_v2',
    biomeId: 'verdant',
    name: 'Altar Bebatuan Kuno',
    lore: 'Dorong megalith batu lumut ke atas lempengan sakral agar gerbang kuno terbuka.',
    type: 'megalith_plates',
    difficulty: 2,
    rewardRelic: 'Segel Tanah Purba',
    rewardExp: 650,
    megalithGrid: {
      cols: 5,
      rows: 5,
      cells: [
        { x: 0, y: 0, type: 'wall' }, { x: 1, y: 0, type: 'wall' }, { x: 2, y: 0, type: 'wall' }, { x: 3, y: 0, type: 'wall' }, { x: 4, y: 0, type: 'wall' },
        { x: 0, y: 1, type: 'wall' }, { x: 1, y: 1, type: 'floor' }, { x: 2, y: 1, type: 'stone' }, { x: 3, y: 1, type: 'plate' }, { x: 4, y: 1, type: 'wall' },
        { x: 0, y: 2, type: 'wall' }, { x: 1, y: 2, type: 'plate' }, { x: 2, y: 2, type: 'stone' }, { x: 3, y: 2, type: 'floor' }, { x: 4, y: 2, type: 'wall' },
        { x: 0, y: 3, type: 'wall' }, { x: 1, y: 3, type: 'floor' }, { x: 2, y: 3, type: 'floor' }, { x: 3, y: 3, type: 'floor' }, { x: 4, y: 3, type: 'wall' },
        { x: 0, y: 4, type: 'wall' }, { x: 1, y: 4, type: 'wall' }, { x: 2, y: 4, type: 'wall' }, { x: 3, y: 4, type: 'wall' }, { x: 4, y: 4, type: 'wall' },
      ],
    },
  },
  {
    id: 'shrine_v3',
    biomeId: 'verdant',
    name: 'Genta Kidung Rimbun',
    lore: 'Ulangi lantunan harmoni nada alam untuk membebaskan jiwa peri penjaga hutan.',
    type: 'harmonic_sequence',
    difficulty: 1,
    rewardRelic: 'Suling Daun Angin',
    rewardExp: 550,
    harmonicSequence: {
      runes: [
        { id: 'v_alpha', symbol: '✦', name: 'Rune Angin', frequency: 329.63, color: '#34d399' },
        { id: 'v_beta', symbol: '◈', name: 'Rune Embun', frequency: 392.00, color: '#38bdf8' },
        { id: 'v_gamma', symbol: '▲', name: 'Rune Kayu', frequency: 440.00, color: '#facc15' },
        { id: 'v_delta', symbol: '⬡', name: 'Rune Matahari', frequency: 523.25, color: '#fb923c' },
      ],
      targetSequence: ['v_alpha', 'v_gamma', 'v_beta', 'v_delta'],
    },
  },

  // Crystal Caverns Puzzles
  {
    id: 'shrine_c1',
    biomeId: 'crystal',
    name: 'Labirin Pembias Kuarsa',
    lore: 'Pantulkan berkas laser kristal ungu melalui beberapa cermin prisma untuk menyalakan inti kristal tidur.',
    type: 'mirror_beam',
    difficulty: 3,
    rewardRelic: 'Inti Kristal Prismatik',
    rewardExp: 800,
    mirrorGrid: {
      cols: 5,
      rows: 5,
      cells: [
        { x: 0, y: 0, type: 'emitter', direction: 'south' },
        { x: 0, y: 3, type: 'mirror', mirrorAngle: '/' },
        { x: 3, y: 3, type: 'mirror', mirrorAngle: '\\' },
        { x: 3, y: 1, type: 'mirror', mirrorAngle: '/' },
        { x: 4, y: 1, type: 'receiver', direction: 'west' },
      ],
    },
  },
  {
    id: 'shrine_c2',
    biomeId: 'crystal',
    name: 'Lempeng Resonansi Stalagmit',
    lore: 'Sejajarkan pilar kuarsa berat di atas titik nodal getaran gua.',
    type: 'megalith_plates',
    difficulty: 3,
    rewardRelic: 'Garpu Tala Kristal',
    rewardExp: 850,
    megalithGrid: {
      cols: 5,
      rows: 5,
      cells: [
        { x: 0, y: 0, type: 'wall' }, { x: 1, y: 0, type: 'wall' }, { x: 2, y: 0, type: 'wall' }, { x: 3, y: 0, type: 'wall' }, { x: 4, y: 0, type: 'wall' },
        { x: 0, y: 1, type: 'wall' }, { x: 1, y: 1, type: 'plate' }, { x: 2, y: 1, type: 'floor' }, { x: 3, y: 1, type: 'stone' }, { x: 4, y: 1, type: 'wall' },
        { x: 0, y: 2, type: 'wall' }, { x: 1, y: 2, type: 'floor' }, { x: 2, y: 2, type: 'wall' }, { x: 3, y: 2, type: 'floor' }, { x: 4, y: 2, type: 'wall' },
        { x: 0, y: 3, type: 'wall' }, { x: 1, y: 3, type: 'stone' }, { x: 2, y: 3, type: 'floor' }, { x: 3, y: 3, type: 'plate' }, { x: 4, y: 3, type: 'wall' },
        { x: 0, y: 4, type: 'wall' }, { x: 1, y: 4, type: 'wall' }, { x: 2, y: 4, type: 'wall' }, { x: 3, y: 4, type: 'wall' }, { x: 4, y: 4, type: 'wall' },
      ],
    },
  },

  // Sunken Atoll Puzzles
  {
    id: 'shrine_s1',
    biomeId: 'sunken',
    name: 'Mercurial Tide Beam',
    lore: 'Sinar aurora air laut harus dialirkan ke kubah mutiara biru samudra.',
    type: 'mirror_beam',
    difficulty: 2,
    rewardRelic: 'Mutiara Arus Samudra',
    rewardExp: 750,
    mirrorGrid: {
      cols: 4,
      rows: 4,
      cells: [
        { x: 1, y: 0, type: 'emitter', direction: 'south' },
        { x: 1, y: 2, type: 'mirror', mirrorAngle: '/' },
        { x: 3, y: 2, type: 'mirror', mirrorAngle: '\\' },
        { x: 3, y: 3, type: 'receiver', direction: 'north' },
      ],
    },
  },

  // Sky Citadel Puzzles
  {
    id: 'shrine_k1',
    biomeId: 'sky',
    name: 'Kuil Genta Langit Astral',
    lore: 'Kombinasi nada genta kosmik kuno membuka gerbang menuju langit ketujuh.',
    type: 'harmonic_sequence',
    difficulty: 4,
    rewardRelic: 'Sayap Eterik Hermes',
    rewardExp: 950,
    harmonicSequence: {
      runes: [
        { id: 's_1', symbol: '✦', name: 'Nada Bintang', frequency: 440.00, color: '#c084fc' },
        { id: 's_2', symbol: '⚡', name: 'Nada Petir', frequency: 554.37, color: '#f472b6' },
        { id: 's_3', symbol: '☄️', name: 'Nada Komet', frequency: 659.25, color: '#60a5fa' },
        { id: 's_4', symbol: '◈', name: 'Nada Nebula', frequency: 880.00, color: '#38bdf8' },
        { id: 's_5', symbol: '⭐', name: 'Nada Kosmos', frequency: 987.77, color: '#fbbf24' },
      ],
      targetSequence: ['s_1', 's_3', 's_2', 's_4', 's_5'],
    },
  },

  // Volcanic Forge Puzzles
  {
    id: 'shrine_f1',
    biomeId: 'volcanic',
    name: 'Tempaan Sinar Magma Inti',
    lore: 'Belokkan panas sinar plasma magma melintasi cermin obsidian berkekuatan tinggi.',
    type: 'mirror_beam',
    difficulty: 4,
    rewardRelic: 'Jantung Magma Abadi',
    rewardExp: 1100,
    mirrorGrid: {
      cols: 5,
      rows: 5,
      cells: [
        { x: 0, y: 2, type: 'emitter', direction: 'east' },
        { x: 2, y: 2, type: 'mirror', mirrorAngle: '\\' },
        { x: 2, y: 4, type: 'mirror', mirrorAngle: '/' },
        { x: 4, y: 4, type: 'mirror', mirrorAngle: '\\' },
        { x: 4, y: 0, type: 'receiver', direction: 'south' },
      ],
    },
  },
];

export const WORLD_CHESTS = [
  { id: 'chest_v1', biomeId: 'verdant', x: 4, y: 3, relic: 'Kompas Kuno Zamrud', lore: 'Menunjukkan arah ke kuil terdekat.' },
  { id: 'chest_v2', biomeId: 'verdant', x: 8, y: 7, relic: 'Batu Rune Kecepatan', lore: 'Meningkatkan kelincahan gerak pengelana.' },
  { id: 'chest_c1', biomeId: 'crystal', x: 3, y: 8, relic: 'Lensa Refraksi Kuarsa', lore: 'Membuat pantulan cahaya semakin terang.' },
  { id: 'chest_s1', biomeId: 'sunken', x: 7, y: 2, relic: 'Cincin Arus Samudra', lore: 'Memberikan perlindungan saat melintasi rawa.' },
  { id: 'chest_k1', biomeId: 'sky', x: 6, y: 6, relic: 'Fragmen Bintang Kejora', lore: 'Serpihan meteor kuno berkilau perak.' },
  { id: 'chest_f1', biomeId: 'volcanic', x: 2, y: 5, relic: 'Jimat Obsidian Api', lore: 'Tahan terhadap hawa panas kawah primordial.' },
];
