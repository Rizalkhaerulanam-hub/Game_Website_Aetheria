import React, { useEffect } from 'react';
import { Play, Trophy, DollarSign, Cloud, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenAdSense: () => void;
  onOpenCloudSync: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenAdSense,
  onOpenCloudSync,
  highScore,
}) => {
  // Bind Enter & Space to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#090d16] text-slate-100">
      {/* Ambient background particles and rune aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        {/* Floating ancient glyph motes */}
        <div className="absolute top-12 left-1/4 text-2xl text-sky-400/20 font-serif animate-bounce">✦</div>
        <div className="absolute top-1/3 right-1/4 text-3xl text-purple-400/20 font-serif animate-pulse">◈</div>
        <div className="absolute bottom-1/3 left-1/5 text-2xl text-emerald-400/20 font-serif">⬡</div>
        <div className="absolute top-20 right-1/5 text-2xl text-amber-400/20 font-serif">✧</div>
      </div>

      {/* Top Bar with High Score & Cloud Sync quick status */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Game Petualangan Puzzle Open-World
          </span>
        </div>

        {highScore > 0 && (
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase">Rekor Terbaik</span>
            <span className="text-sm font-black text-amber-400 tabular-nums font-mono">
              {highScore.toLocaleString('id-ID')} PTS
            </span>
          </div>
        )}
      </div>

      {/* Centerpiece Hero Emblem & Title Lockup */}
      <div className="flex flex-col items-center text-center z-10 max-w-xl my-auto">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-4">
          <svg
            className="w-24 h-24 sm:w-28 sm:h-28 text-sky-400 filter drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer sacred heptagon / rune ring */}
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
            <polygon points="50,14 82,34 82,74 50,92 18,74 18,34" stroke="currentColor" strokeWidth="2.5" />
            {/* Inner crystal prism core */}
            <polygon points="50,26 70,40 70,68 50,80 30,68 30,40" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,158,11,0.15)" />
            <circle cx="50" cy="50" r="8" fill="#38bdf8" />
            <line x1="50" y1="26" x2="50" y2="80" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="30" y1="50" x2="70" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Title Text */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-amber-200 to-emerald-200 drop-shadow-sm font-serif">
          AETHERIA
        </h1>
        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-sky-400/90 mt-1 mb-3">
          The Lost Runes · Eksplorasi Tanpa Batas
        </p>

        <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-6">
          Jelajahi 5 alam purba, pecahkan teka-teki kuil misterius tanpa rasa takut kalah, dan kumpulkan relik suci untuk memuncaki tahta dunia.
        </p>

        {/* Primary Start CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            data-start="true"
            onClick={onStartGame}
            className="w-full py-4 bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-98 text-slate-950 font-black rounded-2xl text-base tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" /> Mulai Petualangan
          </button>
        </div>

        {/* Secondary Quick Menu Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onOpenLeaderboard}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Papan Peringkat
          </button>

          <button
            onClick={onOpenAdSense}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Monetisasi Iklan
          </button>

          <button
            onClick={onOpenCloudSync}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" /> Sinkron Cloud
          </button>
        </div>
      </div>

      {/* Flat borderless control hint line matching game craft rule */}
      <div className="z-10 text-center pb-2">
        <p className="text-[11px] font-mono text-slate-400 tracking-wider">
          WASD / Tombol Panah Gerak · Spasi Interaksi · Esc / P Jeda · M Bisu
        </p>
      </div>
    </div>
  );
};
