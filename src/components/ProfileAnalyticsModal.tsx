import React, { useState } from 'react';
import { User, Award, Compass, BarChart2, Share2, Check, Flame, Clock, Sparkles, X } from 'lucide-react';
import type { PlayerSaveData } from '../game/types.ts';
import { BIOMES } from '../game/worldData.ts';

interface ProfileAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: PlayerSaveData;
  onUpdatePlayerName: (newName: string) => void;
}

export const ProfileAnalyticsModal: React.FC<ProfileAnalyticsModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onUpdatePlayerName,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(saveData.playerName);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      setEditingName(false);
    }
  };

  // Format playtime
  const hours = Math.floor(saveData.stats.totalPlayTimeSec / 3600);
  const minutes = Math.floor((saveData.stats.totalPlayTimeSec % 3600) / 60);
  const playTimeStr = `${hours}j ${minutes}m`;

  // Social share text
  const shareText = `🌟 Saya telah memecahkan ${saveData.stats.puzzlesSolved} Teka-teki Kuno dan mengumpulkan ${saveData.stats.relicsDiscovered} Relik di Aetheria: Lost Runes dengan Skor ${saveData.relicScore.toLocaleString('id-ID')}! Bisakah kamu mengalahkan rekor saya?`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pencapaian Aetheria: Lost Runes',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleShareSocial = (platform: 'whatsapp' | 'twitter' | 'telegram') => {
    const encoded = encodeURIComponent(shareText);
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encoded}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encoded}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encoded}`;
    }
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-title" className="text-lg font-bold text-white flex items-center gap-2">
                Profil & Laporan Analitik Penjelajah
              </h2>
              <p className="text-xs text-slate-400">
                Statistik mendalam petualangan dan progres eksplorasi Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Profil"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Profile Card */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-slate-950 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-2xl shadow-lg">
              🧙‍♂️
            </div>
            <div>
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2 py-1 bg-slate-800 border border-indigo-400 rounded text-sm text-white"
                  />
                  <button type="submit" className="px-2 py-1 bg-indigo-500 text-white rounded text-xs">
                    Simpan
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{saveData.playerName}</h3>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
              )}
              <span className="text-xs text-indigo-300 font-medium block">
                Tingkat Master {saveData.playerLevel} · {BIOMES[saveData.currentBiome]?.name || 'Petualang'}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> {saveData.stats.dailyStreak} Hari Streak
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> {playTimeStr} Bermain
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Skor Relik</span>
            <span className="text-xl font-black text-amber-400 tabular-nums">
              {saveData.relicScore.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* 4 Stat Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Teka-teki Dipecahkan</span>
            <p className="text-lg font-bold text-sky-400 tabular-nums mt-1">{saveData.stats.puzzlesSolved}</p>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Relik Ditemukan</span>
            <p className="text-lg font-bold text-amber-400 tabular-nums mt-1">{saveData.stats.relicsDiscovered}</p>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Langkah Eksplorasi</span>
            <p className="text-lg font-bold text-emerald-400 tabular-nums mt-1">{saveData.stats.stepsTaken.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400">Iklan Berhadiah</span>
            <p className="text-lg font-bold text-purple-400 tabular-nums mt-1">{saveData.stats.adImpressionsWatched} ditonton</p>
          </div>
        </div>

        {/* Biome Exploration Progress */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" /> Progres Eksplorasi 5 Alam (Biomes)
          </h4>
          <div className="space-y-2.5">
            {Object.values(BIOMES).map((b) => {
              const solvedInBiome = saveData.solvedPuzzleIds.filter((id) => id.includes(b.id[0])).length;
              const pct = Math.min(100, Math.round((solvedInBiome / b.totalPuzzles) * 100));

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-200">{b.name}</span>
                    <span className="text-slate-400 tabular-nums">{pct}% Selesai</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Share Section */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-400" /> Bagikan Pencapaian ke Media Sosial
            </h4>
            {copiedShare && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Teks pencapaian disalin!
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleShareSocial('whatsapp')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleShareSocial('twitter')}
              className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              Twitter / X
            </button>
            <button
              onClick={() => handleShareSocial('telegram')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              Telegram
            </button>
            <button
              onClick={handleNativeShare}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Salin / Bagikan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
