import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Globe, RefreshCw, User, Flame, X } from 'lucide-react';
import type { LeaderboardEntry } from '../game/types.ts';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerId: string;
  currentPlayerName: string;
  currentScore: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerId,
  currentPlayerName,
  currentScore,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setEntries(data.leaderboard);
      } else {
        throw new Error('Gagal mengambil data papan peringkat');
      }
    } catch (err: any) {
      setError(err?.message || 'Tidak dapat terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="leaderboard-title" className="text-lg font-bold text-white flex items-center gap-2">
                Papan Peringkat Global Aetheria
              </h2>
              <p className="text-xs text-slate-400">
                Kompetisi teka-teki & eksplorasi relik di seluruh dunia
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              aria-label="Segarkan Papan Peringkat"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Tutup Papan Peringkat"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Player Card */}
        <div className="p-3.5 mb-4 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-amber-300/80 font-medium">Status Anda</span>
              <p className="font-bold text-white text-sm">{currentPlayerName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Skor Relik</span>
            <p className="font-black text-amber-400 tabular-nums text-base">{currentScore.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50">
          {loading && entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Memuat data penjelajah dunia...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-rose-400 text-sm">
              {error}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {entries.map((entry, index) => {
                const rank = entry.rank || index + 1;
                const isMe = entry.playerId === currentPlayerId;

                return (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between p-3.5 transition-colors ${
                      isMe ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 text-center font-bold font-mono">
                        {rank === 1 ? (
                          <span className="text-amber-400 flex items-center justify-center">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 flex items-center justify-center">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 flex items-center justify-center">🥉</span>
                        ) : (
                          <span className="text-xs text-slate-500">#{rank}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{entry.playerName}</span>
                          {isMe && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Lv. {entry.level}</span>
                          <span>·</span>
                          <span>{entry.puzzlesSolved} Teka-teki</span>
                          <span>·</span>
                          <span>{entry.relicsFound} Relik</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300 tabular-nums">
                        {entry.score.toLocaleString('id-ID')}
                      </span>
                      <span className="block text-[10px] text-slate-500 capitalize">{entry.currentBiome}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
