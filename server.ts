import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// In-memory persistent state stores with seed data
interface LeaderboardRecord {
  playerId: string;
  playerName: string;
  score: number;
  level: number;
  puzzlesSolved: number;
  relicsFound: number;
  currentBiome: string;
  updatedAt: number;
}

let leaderboard: LeaderboardRecord[] = [
  { playerId: 'bot_aria', playerName: 'Aria Penjelajah Rune', score: 14250, level: 15, puzzlesSolved: 24, relicsFound: 12, currentBiome: 'sky', updatedAt: Date.now() - 3600000 },
  { playerId: 'bot_bima', playerName: 'Bima Guardian', score: 11800, level: 12, puzzlesSolved: 19, relicsFound: 9, currentBiome: 'crystal', updatedAt: Date.now() - 7200000 },
  { playerId: 'bot_chandra', playerName: 'Chandra Seeker', score: 9400, level: 10, puzzlesSolved: 15, relicsFound: 7, currentBiome: 'sunken', updatedAt: Date.now() - 14400000 },
  { playerId: 'bot_dewi', playerName: 'Dewi Cahaya', score: 7100, level: 8, puzzlesSolved: 11, relicsFound: 5, currentBiome: 'verdant', updatedAt: Date.now() - 28800000 },
  { playerId: 'bot_eka', playerName: 'Eka Pengelana', score: 4500, level: 5, puzzlesSolved: 7, relicsFound: 3, currentBiome: 'verdant', updatedAt: Date.now() - 43200000 },
];

const cloudSaves = new Map<string, { encryptedData: string; updatedAt: number; playerId: string }>();

interface AnalyticsEventRecord {
  eventType: string;
  playerId: string;
  timestamp: number;
  details?: any;
}

const analyticsLogs: AnalyticsEventRecord[] = [];

// API: Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
  res.json({ success: true, leaderboard: sorted });
});

app.post('/api/leaderboard', (req, res) => {
  const { playerId, playerName, score, level, puzzlesSolved, relicsFound, currentBiome } = req.body;
  if (!playerId || typeof score !== 'number') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const existingIdx = leaderboard.findIndex((p) => p.playerId === playerId);
  const entry: LeaderboardRecord = {
    playerId,
    playerName: (playerName || 'Pengelana Tanpa Nama').slice(0, 30),
    score,
    level: level || 1,
    puzzlesSolved: puzzlesSolved || 0,
    relicsFound: relicsFound || 0,
    currentBiome: currentBiome || 'verdant',
    updatedAt: Date.now(),
  };

  if (existingIdx >= 0) {
    if (score > leaderboard[existingIdx].score) {
      leaderboard[existingIdx] = entry;
    } else {
      leaderboard[existingIdx].playerName = entry.playerName;
      leaderboard[existingIdx].updatedAt = Date.now();
    }
  } else {
    leaderboard.push(entry);
  }

  const rank = [...leaderboard].sort((a, b) => b.score - a.score).findIndex((p) => p.playerId === playerId) + 1;
  res.json({ success: true, rank, totalPlayers: leaderboard.length });
});

// API: Cloud Sync (Encrypted save data across devices)
app.post('/api/sync/save', (req, res) => {
  const { syncKey, encryptedData, playerId } = req.body;
  if (!syncKey || !encryptedData) {
    return res.status(400).json({ success: false, error: 'Sync Key dan data terenkripsi dibutuhkan' });
  }

  const normalizedKey = String(syncKey).trim().toUpperCase();
  cloudSaves.set(normalizedKey, {
    encryptedData,
    updatedAt: Date.now(),
    playerId: playerId || 'unknown',
  });

  res.json({
    success: true,
    message: 'Data berhasil disinkronkan ke Cloud Aetheria',
    syncKey: normalizedKey,
    updatedAt: Date.now(),
  });
});

app.post('/api/sync/load', (req, res) => {
  const { syncKey } = req.body;
  if (!syncKey) {
    return res.status(400).json({ success: false, error: 'Sync Key dibutuhkan' });
  }

  const normalizedKey = String(syncKey).trim().toUpperCase();
  const found = cloudSaves.get(normalizedKey);
  if (!found) {
    return res.status(404).json({ success: false, error: 'Kode Sinkronisasi tidak ditemukan atau kadaluarsa' });
  }

  res.json({
    success: true,
    encryptedData: found.encryptedData,
    updatedAt: found.updatedAt,
  });
});

// API: Daily Challenge & Community Updates
app.get('/api/daily-challenge', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    success: true,
    date: today,
    challenge: {
      title: 'Tantangan Harmoni Kristal Purba',
      description: 'Selesaikan 2 Puzzle Laser Prisma di Gua Kristal untuk membuka Berkah Astral!',
      bonusRelicPoints: 1200,
      rewardItem: 'Prisma Cahaya Bintang',
      expiresInHours: 24,
    },
  });
});

// API: Analytics tracking
app.post('/api/analytics/log', (req, res) => {
  const { eventType, playerId, details } = req.body;
  if (eventType) {
    analyticsLogs.push({
      eventType,
      playerId: playerId || 'anon',
      timestamp: Date.now(),
      details,
    });
    // keep memory bounded
    if (analyticsLogs.length > 2000) {
      analyticsLogs.splice(0, 500);
    }
  }
  res.json({ success: true });
});

app.get('/api/analytics/overview', (req, res) => {
  const totalEvents = analyticsLogs.length;
  const adEvents = analyticsLogs.filter((l) => l.eventType === 'ad_watched').length;
  const puzzleEvents = analyticsLogs.filter((l) => l.eventType === 'puzzle_solved').length;
  res.json({
    success: true,
    totalEvents,
    adEvents,
    puzzleEvents,
    activeLeaderboardCount: leaderboard.length,
    serverUptimeSec: Math.floor(process.uptime()),
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aetheria Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Aetheria Server] Failed to start:', err);
  process.exit(1);
});
