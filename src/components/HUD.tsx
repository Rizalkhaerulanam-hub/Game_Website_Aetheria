import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Trophy,
  DollarSign,
  Package,
  Cloud,
  Settings,
  Wifi,
  WifiOff,
  Flame,
  User,
  Sparkles
} from 'lucide-react';
import type { BiomeId } from '../game/types.ts';
import { BIOMES } from '../game/worldData.ts';

interface HUDProps {
  playerLevel: number;
  relicScore: number;
  currentBiome: BiomeId;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenPause: () => void;
  onOpenLeaderboard: () => void;
  onOpenAdSense: () => void;
  onOpenInventory: () => void;
  onOpenCloudSync: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  isOnline: boolean;
  dailyStreak: number;
  interactPrompt: string | null;
  onInteract: () => void;
  onMoveButton?: (dx: number, dy: number) => void;
  buffMultiplierActive: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  playerLevel,
  relicScore,
  currentBiome,
  soundMuted,
  onToggleSound,
  onOpenPause,
  onOpenLeaderboard,
  onOpenAdSense,
  onOpenInventory,
  onOpenCloudSync,
  onOpenProfile,
  onOpenSettings,
  isOnline,
  dailyStreak,
  interactPrompt,
  onInteract,
  onMoveButton,
  buffMultiplierActive,
}) => {
  const biome = BIOMES[currentBiome] || BIOMES.verdant;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar Perimeter Clusters */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left Cluster: Player Level, Score, Biome */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onOpenProfile}
            aria-label="Buka Profil Pengelana"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl hover:bg-slate-800 transition-all cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-sm shadow">
              {playerLevel}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                Skor Relik {buffMultiplierActive && <span className="text-emerald-400 font-black animate-pulse">(2X BUFF)</span>}
              </span>
              <span className="font-mono font-black text-base text-amber-300 tabular-nums">
                {relicScore.toLocaleString('id-ID')}
              </span>
            </div>
          </button>

          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-none"
            style={{
              backgroundColor: `rgba(${biome.bgRgb}, 0.15)`,
              borderColor: `rgba(${biome.bgRgb}, 0.4)`,
              color: biome.accent,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: biome.color }} />
            {biome.name}
          </div>
        </div>

        {/* Top-Right Cluster: Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* AdSense Rewarded Monetization Button */}
          <button
            onClick={onOpenAdSense}
            aria-label="Pusat Monetisasi Iklan"
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Iklan & Bonus</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            aria-label="Papan Peringkat Global"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            aria-label="Buka Tas Relik"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <Package className="w-4 h-4 text-sky-400" />
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={onOpenCloudSync}
            aria-label="Sinkronisasi Cloud"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <Cloud className="w-4 h-4 text-sky-400" />
          </button>

          {/* Sound Mute Button */}
          <button
            onClick={onToggleSound}
            aria-label={soundMuted ? 'Bunyikan Suara' : 'Bisukan Suara'}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onOpenPause}
            aria-label="Jeda Permainan"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <Pause className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Bottom Center Contextual Prompt */}
      {interactPrompt && (
        <div className="mx-auto pointer-events-auto mb-2">
          <button
            onClick={onInteract}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-sky-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" /> {interactPrompt}
          </button>
        </div>
      )}

      {/* Bottom Perimeter Cluster: Status / Mobile Virtual Controls */}
      <div className="flex items-end justify-between w-full">
        {/* Left: Offline status & Daily Streak */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] flex items-center gap-1.5 text-slate-300">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <WifiOff className="w-3 h-3" /> Offline (Tersimpan Lokal)
              </span>
            )}
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-1 font-medium">
            <Flame className="w-3 h-3 fill-amber-400" /> {dailyStreak} Hari
          </div>
        </div>

        {/* Right: On mobile / touch screen, show compact on-screen navigation buttons */}
        {onMoveButton && (
          <div className="pointer-events-auto flex flex-col items-center gap-1 sm:hidden">
            <button
              onClick={() => onMoveButton(0, -1)}
              aria-label="Gerak Atas"
              className="w-11 h-11 bg-slate-900/80 active:bg-sky-500 active:text-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white shadow-lg flex items-center justify-center cursor-pointer"
            >
              ▲
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onMoveButton(-1, 0)}
                aria-label="Gerak Kiri"
                className="w-11 h-11 bg-slate-900/80 active:bg-sky-500 active:text-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white shadow-lg flex items-center justify-center cursor-pointer"
              >
                ◀
              </button>
              <button
                onClick={() => onMoveButton(0, 1)}
                aria-label="Gerak Bawah"
                className="w-11 h-11 bg-slate-900/80 active:bg-sky-500 active:text-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white shadow-lg flex items-center justify-center cursor-pointer"
              >
                ▼
              </button>
              <button
                onClick={() => onMoveButton(1, 0)}
                aria-label="Gerak Kanan"
                className="w-11 h-11 bg-slate-900/80 active:bg-sky-500 active:text-slate-950 border border-slate-700 rounded-xl text-lg font-bold text-white shadow-lg flex items-center justify-center cursor-pointer"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
