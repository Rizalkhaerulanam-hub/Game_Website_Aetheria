import React, { useState } from 'react';
import { Cloud, Lock, Copy, Check, ArrowDownToLine, ArrowUpFromLine, KeyRound, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { encryptSaveData, decryptSaveData } from '../game/encryption.ts';
import type { PlayerSaveData } from '../game/types.ts';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSaveData: PlayerSaveData;
  onRestoreSaveData: (data: PlayerSaveData) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentSaveData,
  onRestoreSaveData,
}) => {
  const [syncKeyInput, setSyncKeyInput] = useState('');
  const [cloudStatus, setCloudStatus] = useState<string | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Derive stable 8-char sync code from player ID
  const mySyncKey = (currentSaveData.playerId.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'AETHPLAYER').slice(0, 8);

  if (!isOpen) return null;

  // Cloud Save
  const handleUploadCloudSave = async () => {
    setIsProcessing(true);
    setCloudStatus(null);
    setCloudError(null);
    try {
      const encryptedString = encryptSaveData(currentSaveData);
      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncKey: mySyncKey,
          encryptedData: encryptedString,
          playerId: currentSaveData.playerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCloudStatus(`Sukses! Progres Anda tersimpan di Cloud Aetheria dengan Kode: ${mySyncKey}`);
      } else {
        throw new Error(data.error || 'Gagal menyimpan ke Cloud');
      }
    } catch (err: any) {
      setCloudError(err?.message || 'Koneksi gagal atau offline. Data tetap tersimpan aman secara lokal.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cloud Restore
  const handleDownloadCloudSave = async () => {
    const keyToLoad = syncKeyInput.trim().toUpperCase();
    if (!keyToLoad) {
      setCloudError('Masukkan kode sinkronisasi terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    setCloudStatus(null);
    setCloudError(null);
    try {
      const res = await fetch('/api/sync/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncKey: keyToLoad }),
      });
      const data = await res.json();
      if (data.success && data.encryptedData) {
        const decrypted = decryptSaveData<PlayerSaveData>(data.encryptedData);
        if (decrypted.success && decrypted.data) {
          onRestoreSaveData(decrypted.data);
          setCloudStatus(`Berhasil! Data penjelajah "${decrypted.data.playerName}" dipulihkan.`);
        } else {
          throw new Error(decrypted.error || 'Gagal memverifikasi keaslian data');
        }
      } else {
        throw new Error(data.error || 'Kode sinkronisasi tidak ditemukan');
      }
    } catch (err: any) {
      setCloudError(err?.message || 'Gagal memulihkan dari Cloud');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy sync key
  const handleCopyKey = () => {
    navigator.clipboard.writeText(mySyncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Copy raw encrypted string for offline manual backup
  const handleCopyRawBackup = () => {
    const encrypted = encryptSaveData(currentSaveData);
    navigator.clipboard.writeText(encrypted);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 id="sync-title" className="text-lg font-bold text-white flex items-center gap-2">
                Sinkronisasi Awan & Enkripsi Data
              </h2>
              <p className="text-xs text-slate-400">
                Pindahkan progres game ke HP, Tablet, atau Laptop lain dengan aman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Sinkronisasi"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security badge */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Enkripsi Tingkat Lanjut Aktif</strong>: Semua data diproteksi dengan HMAC Checksum anti-tamper untuk menjaga validitas leaderboard.
          </span>
        </div>

        {/* Cloud Upload Section */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" /> Kode Sinkronisasi Perangkat Ini
            </span>
            <button
              onClick={handleCopyKey}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey ? 'Disalin' : 'Salin Kode'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="font-mono text-lg font-black text-amber-300 tracking-wider">
              {mySyncKey}
            </span>
            <button
              onClick={handleUploadCloudSave}
              disabled={isProcessing}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shadow flex items-center gap-1.5"
            >
              <ArrowUpFromLine className="w-3.5 h-3.5" /> Simpan ke Cloud
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Gunakan kode ini di perangkat lain untuk melanjutkan perjalanan Anda kapan saja.
          </p>
        </div>

        {/* Cloud Download / Restore Section */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" /> Muat Progres dari Perangkat Lain
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={syncKeyInput}
              onChange={(e) => setSyncKeyInput(e.target.value)}
              placeholder="Masukkan Kode (contoh: AETH1234)"
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white uppercase focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleDownloadCloudSave}
              disabled={isProcessing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow flex items-center gap-1.5"
            >
              Muat Progres
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {cloudStatus && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{cloudStatus}</span>
          </div>
        )}

        {cloudError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{cloudError}</span>
          </div>
        )}

        {/* Raw Encrypted Backup Option */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Cadangan Manual Cadangan:</span>
          <button
            onClick={handleCopyRawBackup}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            {copiedRaw ? 'Terenkripsi Disalin' : 'Salin String Enkripsi Mentah'}
          </button>
        </div>
      </div>
    </div>
  );
};
