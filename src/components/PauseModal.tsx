import React from 'react';
import { Play, RotateCcw, Home, Settings, Sparkles } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onReturnTitle: () => void;
  score: number;
  puzzlesCount: number;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenSettings,
  onReturnTitle,
  score,
  puzzlesCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center space-y-5 text-slate-100">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Permainan Dijeda</span>
          <h2 id="pause-title" className="text-xl font-black text-white tracking-wide">
            JEDA EKSPLORASI
          </h2>
        </div>

        {/* Quick run stats */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div>
            <span className="text-[11px] text-slate-400">Skor Relik</span>
            <p className="font-bold text-amber-400 tabular-nums">{score.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Teka-teki Selesai</span>
            <p className="font-bold text-sky-400 tabular-nums">{puzzlesCount}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" /> Lanjutkan Petualangan [Esc]
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" /> Pengaturan & Tema
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> Kembali ke Layar Utama
          </button>
        </div>
      </div>
    </div>
  );
};
