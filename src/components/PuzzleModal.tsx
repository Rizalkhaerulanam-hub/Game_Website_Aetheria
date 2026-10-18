import React, { useState, useEffect } from 'react';
import type { ShrinePuzzleData, MirrorCell, MegalithCell } from '../game/types.ts';
import { calculateBeamPath, checkMegalithSolved, moveMegalithStone } from '../game/puzzleLogic.ts';
import { sound } from '../game/audio.ts';
import { RotateCw, Undo2, RefreshCw, Award, Sparkles, CheckCircle2, X } from 'lucide-react';

interface PuzzleModalProps {
  shrine: ShrinePuzzleData;
  isOpen: boolean;
  onClose: () => void;
  onSolved: (shrineId: string, relicName: string, exp: number) => void;
  isAlreadySolved: boolean;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  shrine,
  isOpen,
  onClose,
  onSolved,
  isAlreadySolved,
}) => {
  // Mirror Beam State
  const [mirrorCells, setMirrorCells] = useState<MirrorCell[]>([]);
  // Megalith State
  const [megalithCells, setMegalithCells] = useState<MegalithCell[]>([]);
  const [megalithHistory, setMegalithHistory] = useState<MegalithCell[][]>([]);
  // Harmonic Sequence State
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [harmonicTarget, setHarmonicTarget] = useState<string[]>([]);
  // Solved state
  const [solved, setSolved] = useState(isAlreadySolved);
  const [showingReward, setShowingReward] = useState(false);

  // Initialize puzzle data when shrine opens
  useEffect(() => {
    if (!isOpen) return;
    setSolved(isAlreadySolved);
    setShowingReward(false);

    if (shrine.type === 'mirror_beam' && shrine.mirrorGrid) {
      // Deep clone cells
      setMirrorCells(shrine.mirrorGrid.cells.map((c) => ({ ...c })));
    } else if (shrine.type === 'megalith_plates' && shrine.megalithGrid) {
      const cloned = shrine.megalithGrid.cells.map((c) => ({ ...c }));
      setMegalithCells(cloned);
      setMegalithHistory([]);
    } else if (shrine.type === 'harmonic_sequence' && shrine.harmonicSequence) {
      setUserSequence([]);
      setHarmonicTarget([...shrine.harmonicSequence.targetSequence]);
    }
  }, [isOpen, shrine, isAlreadySolved]);

  if (!isOpen) return null;

  // --- Mirror Beam Handlers ---
  const handleRotateMirror = (x: number, y: number) => {
    if (solved) return;
    sound.playRuneTone(1.2);
    setMirrorCells((prev) => {
      const updated = prev.map((cell) => {
        if (cell.x === x && cell.y === y && cell.type === 'mirror') {
          return {
            ...cell,
            mirrorAngle: cell.mirrorAngle === '/' ? ('\\' as const) : ('/' as const),
          };
        }
        return cell;
      });

      // Check if this solves it
      if (shrine.mirrorGrid) {
        const { receiverActivated } = calculateBeamPath(
          shrine.mirrorGrid.cols,
          shrine.mirrorGrid.rows,
          updated
        );
        if (receiverActivated) {
          triggerVictory();
        }
      }
      return updated;
    });
  };

  // --- Megalith Handlers ---
  const handleMoveMegalith = (dx: number, dy: number) => {
    if (solved || !shrine.megalithGrid) return;

    // Find any movable stone
    // If multiple stones exist, pick the stone that has empty floor in that direction
    const stoneCells = megalithCells.filter((c) => c.type === 'stone' || c.type === 'stone_on_plate');
    let moveExecuted = false;
    let nextCells = megalithCells;

    for (const stone of stoneCells) {
      const res = moveMegalithStone(
        nextCells,
        shrine.megalithGrid.cols,
        shrine.megalithGrid.rows,
        stone.x,
        stone.y,
        dx,
        dy
      );
      if (res.success) {
        moveExecuted = true;
        nextCells = res.newCells;
        break;
      }
    }

    if (moveExecuted) {
      sound.playStonePush();
      setMegalithHistory((prev) => [...prev, megalithCells]);
      setMegalithCells(nextCells);
      if (checkMegalithSolved(nextCells)) {
        triggerVictory();
      }
    }
  };

  const handleMegalithUndo = () => {
    if (megalithHistory.length === 0 || solved) return;
    const prev = megalithHistory[megalithHistory.length - 1];
    setMegalithCells(prev);
    setMegalithHistory((old) => old.slice(0, -1));
    sound.playRuneTone(0.8);
  };

  const handleMegalithReset = () => {
    if (!shrine.megalithGrid || solved) return;
    setMegalithCells(shrine.megalithGrid.cells.map((c) => ({ ...c })));
    setMegalithHistory([]);
    sound.playRuneTone(0.7);
  };

  // --- Harmonic Sequence Handlers ---
  const handlePressHarmonicRune = (runeId: string, freq: number) => {
    if (solved) return;
    sound.playRuneTone(freq / 440);
    const newSeq = [...userSequence, runeId];
    setUserSequence(newSeq);

    // Verify
    const currentStep = newSeq.length - 1;
    if (newSeq[currentStep] !== harmonicTarget[currentStep]) {
      // Mistake, reset sequence
      setTimeout(() => setUserSequence([]), 400);
      return;
    }

    if (newSeq.length === harmonicTarget.length) {
      triggerVictory();
    }
  };

  const triggerVictory = () => {
    setSolved(true);
    setShowingReward(true);
    sound.playVictoryFanfare();
    onSolved(shrine.id, shrine.rewardRelic, shrine.rewardExp);
  };

  // Render Mirror Beam Grid
  const renderMirrorGrid = () => {
    if (!shrine.mirrorGrid) return null;
    const { cols, rows } = shrine.mirrorGrid;
    const { hitCells, receiverActivated } = calculateBeamPath(cols, rows, mirrorCells);

    const cellLookup = new Map<string, MirrorCell>();
    mirrorCells.forEach((c) => cellLookup.set(`${c.x},${c.y}`, c));

    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="grid gap-2 bg-slate-950 p-4 rounded-2xl border border-sky-500/30 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows }).map((_, y) =>
            Array.from({ length: cols }).map((_, x) => {
              const cell = cellLookup.get(`${x},${y}`);
              const isHit = hitCells.has(`${x},${y}`);

              return (
                <div
                  key={`${x},${y}`}
                  onClick={() => cell?.type === 'mirror' && handleRotateMirror(x, y)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold relative transition-all select-none ${
                    cell?.type === 'mirror'
                      ? 'bg-sky-950/80 hover:bg-sky-900 border-2 border-sky-400 cursor-pointer shadow-lg active:scale-95'
                      : cell?.type === 'emitter'
                      ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300'
                      : cell?.type === 'receiver'
                      ? receiverActivated
                        ? 'bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 animate-pulse'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                      : cell?.type === 'wall'
                      ? 'bg-slate-900 border border-slate-800 text-slate-700'
                      : 'bg-slate-900/40 border border-slate-800/60'
                  }`}
                >
                  {/* Laser Beam Glow Trace */}
                  {isHit && (
                    <div className="absolute inset-2 rounded bg-sky-400/20 blur-sm pointer-events-none" />
                  )}

                  {cell?.type === 'emitter' && (
                    <span className="text-xs uppercase tracking-tight font-black">
                      ⚡ Sinar ({cell.direction?.[0].toUpperCase()})
                    </span>
                  )}

                  {cell?.type === 'receiver' && (
                    <span className="text-xs uppercase tracking-tight font-black">
                      {receiverActivated ? '🌟 Inti Aktif' : '⭕ Penerima'}
                    </span>
                  )}

                  {cell?.type === 'mirror' && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-2xl font-mono text-sky-300">{cell.mirrorAngle}</span>
                      <span className="text-[10px] text-sky-400 flex items-center gap-0.5">
                        <RotateCw className="w-2.5 h-2.5" /> Putar
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <p className="text-xs text-slate-400">
          Klik cermin <span className="font-mono text-sky-300 text-sm">[/]</span> untuk memutar sudut pantulan dan mengalirkan sinar laser menuju inti penerima.
        </p>
      </div>
    );
  };

  // Render Megalith Sokoban Grid
  const renderMegalithGrid = () => {
    if (!shrine.megalithGrid) return null;
    const { cols, rows } = shrine.megalithGrid;
    const cellLookup = new Map<string, MegalithCell>();
    megalithCells.forEach((c) => cellLookup.set(`${c.x},${c.y}`, c));

    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="grid gap-1.5 bg-slate-950 p-4 rounded-2xl border border-amber-500/30 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows }).map((_, y) =>
            Array.from({ length: cols }).map((_, x) => {
              const cell = cellLookup.get(`${x},${y}`);
              const isPlate = cell?.type === 'plate';
              const isStone = cell?.type === 'stone';
              const isStoneOnPlate = cell?.type === 'stone_on_plate';
              const isWall = cell?.type === 'wall';

              return (
                <div
                  key={`${x},${y}`}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-sm relative transition-all ${
                    isWall
                      ? 'bg-slate-900 border border-slate-800'
                      : isStoneOnPlate
                      ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-md scale-95'
                      : isStone
                      ? 'bg-amber-900/80 border-2 border-amber-400 text-amber-200 shadow-lg'
                      : isPlate
                      ? 'bg-amber-950/40 border border-dashed border-amber-400/60'
                      : 'bg-slate-900/30 border border-slate-800/40'
                  }`}
                >
                  {isStoneOnPlate && '💎'}
                  {isStone && '🗿'}
                  {isPlate && <span className="w-4 h-4 rounded-full border border-amber-400/80" />}
                </div>
              );
            })
          )}
        </div>

        {/* Megalith Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMoveMegalith(0, -1)}
            aria-label="Dorong Atas"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
          >
            ↑
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleMoveMegalith(-1, 0)}
              aria-label="Dorong Kiri"
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => handleMoveMegalith(0, 1)}
              aria-label="Dorong Bawah"
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              ↓
            </button>
            <button
              onClick={() => handleMoveMegalith(1, 0)}
              aria-label="Dorong Kanan"
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              →
            </button>
          </div>
          <button
            onClick={handleMegalithUndo}
            disabled={megalithHistory.length === 0}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={handleMegalithReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    );
  };

  // Render Harmonic Sequence Runes
  const renderHarmonicSequence = () => {
    if (!shrine.harmonicSequence) return null;
    const { runes, targetSequence } = shrine.harmonicSequence;

    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          {targetSequence.map((targetId, idx) => {
            const isCompleted = userSequence.length > idx;
            return (
              <div
                key={idx}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
                  isCompleted
                    ? 'bg-purple-950 border-purple-400 text-purple-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-600'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {runes.map((rune) => (
            <button
              key={rune.id}
              onClick={() => handlePressHarmonicRune(rune.id, rune.frequency)}
              className="px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-purple-500/40 hover:border-purple-400 flex flex-col items-center gap-1 text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <span className="text-2xl font-serif" style={{ color: rune.color }}>
                {rune.symbol}
              </span>
              <span className="text-xs font-medium text-slate-300">{rune.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shrine-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Tingkat {shrine.difficulty}
              </span>
              <h2 id="shrine-title" className="text-lg font-bold text-white">
                {shrine.name}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 italic">{shrine.lore}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Teka-teki"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Puzzle Board */}
        <div className="my-4">
          {shrine.type === 'mirror_beam' && renderMirrorGrid()}
          {shrine.type === 'megalith_plates' && renderMegalithGrid()}
          {shrine.type === 'harmonic_sequence' && renderHarmonicSequence()}
        </div>

        {/* Solved Celebration Box */}
        {showingReward && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-sky-950/80 border border-emerald-400/50 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mb-2">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="font-bold text-lg text-emerald-300">Kuil Berhasil Dibangkitkan!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Anda memperoleh Relik Langka: <strong>{shrine.rewardRelic}</strong> (+{shrine.rewardExp} Skor Relik)
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
            >
              Lanjutkan Eksplorasi
            </button>
          </div>
        )}

        {isAlreadySolved && !showingReward && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kuil ini telah selesai dipecahkan.
            </span>
            <span className="text-slate-400">Relik: {shrine.rewardRelic}</span>
          </div>
        )}
      </div>
    </div>
  );
};
