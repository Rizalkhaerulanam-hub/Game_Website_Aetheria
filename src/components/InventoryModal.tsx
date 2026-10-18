import React from 'react';
import { Package, Sparkles, X } from 'lucide-react';
import type { PlayerInventoryItem } from '../game/types.ts';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: PlayerInventoryItem[];
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
}) => {
  if (!isOpen) return null;

  const rarityColors = {
    common: 'border-slate-700 bg-slate-900/60 text-slate-300',
    rare: 'border-sky-500/40 bg-sky-950/40 text-sky-300',
    epic: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
    legendary: 'border-amber-500/50 bg-amber-950/50 text-amber-300',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 id="inventory-title" className="text-lg font-bold text-white flex items-center gap-2">
                Tas Relik & Artefak Kuno
              </h2>
              <p className="text-xs text-slate-400">
                Peninggalan peradaban purba yang telah Anda kumpulkan ({inventory.length} Artefak)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Tas Relik"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item List */}
        {inventory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Tas Anda masih kosong. Jelajahi kuil dan peti kuno di alam untuk menemukan relik legendaris!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  rarityColors[item.rarity] || rarityColors.common
                }`}
              >
                <div className="text-2xl select-none pt-0.5">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/10">
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
