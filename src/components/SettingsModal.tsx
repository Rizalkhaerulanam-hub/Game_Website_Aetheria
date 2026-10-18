import React, { useState } from 'react';
import { Settings, Moon, Sun, Volume2, VolumeX, Bell, Eye, Palette, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { PlayerSaveData } from '../game/types.ts';
import { sound } from '../game/audio.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlayerSaveData['settings'];
  onUpdateSettings: (newSettings: Partial<PlayerSaveData['settings']>) => void;
  onResetSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSave,
}) => {
  const [notificationTestStatus, setNotificationTestStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextMuted = !settings.soundMuted;
    sound.setMuted(nextMuted);
    onUpdateSettings({ soundMuted: nextMuted });
  };

  const handleRequestPushNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          onUpdateSettings({ pushNotificationEnabled: true });
          new Notification('Aetheria: Lost Runes', {
            body: 'Notifikasi pintar aktif! Anda akan menerima pembaruan harian dan tantangan spesial.',
            icon: '/manifest.json',
          });
          setNotificationTestStatus('Izin notifikasi disetujui!');
        } else {
          onUpdateSettings({ pushNotificationEnabled: false });
          setNotificationTestStatus('Izin notifikasi ditolak oleh browser.');
        }
      } catch {
        setNotificationTestStatus('Browser tidak mendukung notifikasi push.');
      }
    } else {
      setNotificationTestStatus('Notifikasi tidak didukung pada browser ini.');
    }
    setTimeout(() => setNotificationTestStatus(null), 3000);
  };

  const themes = [
    { id: 'dark', label: 'Midnight Obsidian', desc: 'Gelap pekat, hemat daya & nyaman di mata malam hari' },
    { id: 'emerald', label: 'Emerald Forest', desc: 'Nuansa hijau lumut suaka alam yang menyejukkan' },
    { id: 'cyber', label: 'Cyber Twilight', desc: 'Gradasi ungu eterik dan kristal neon' },
    { id: 'contrast', label: 'Solar High Contrast', desc: 'Kontras maksimum untuk aksesibilitas tinggi' },
  ] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
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
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-bold text-white flex items-center gap-2">
                Pengaturan & Aksesibilitas
              </h2>
              <p className="text-xs text-slate-400">
                Kustomisasi tema, audio, kenyamanan mata, dan notifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme customization */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-sky-400" /> Kustomisasi Tema Visual
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ theme: t.id })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.theme === t.id
                    ? 'bg-sky-950/80 border-sky-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.label}</span>
                  {settings.theme === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Audio settings */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300">
              {settings.soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white">Suara & Sintesis Musik Prosedural</span>
              <p className="text-[11px] text-slate-400">Audio sintetis Web Audio tanpa loading aset</p>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              settings.soundMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {settings.soundMuted ? 'Suara Mati [M]' : 'Suara Aktif [M]'}
          </button>
        </div>

        {/* Accessibility features */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> Fitur Aksesibilitas Tinggi
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Bantuan Glif Buta Warna</span>
                <p className="text-[11px] text-slate-400">Setiap rune memiliki simbol geometri unik selain warna</p>
              </div>
              <input
                type="checkbox"
                checked={settings.accessibleColors}
                onChange={(e) => onUpdateSettings({ accessibleColors: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <div>
                <span className="text-xs font-bold text-white">Ukuran Teks Ramah Baca</span>
                <p className="text-[11px] text-slate-400">Perbesar teks keterangan untuk kenyamanan penglihatan</p>
              </div>
              <input
                type="checkbox"
                checked={settings.largeFont}
                onChange={(e) => onUpdateSettings({ largeFont: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Push Notification & Daily Reminders */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-purple-400" /> Notifikasi Pintar & Pengingat Harian
          </label>
          <p className="text-xs text-slate-400">
            Dapatkan peringatan tantangan harian dan pembaruan komunitas tepat waktu.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-white">Waktu Pengingat Harian:</span>
            <input
              type="time"
              value={settings.dailyReminderTime || '19:00'}
              onChange={(e) => onUpdateSettings({ dailyReminderTime: e.target.value })}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
            <button
              onClick={handleRequestPushNotification}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
            >
              <Bell className="w-3.5 h-3.5" /> Uji & Aktifkan Notifikasi Push
            </button>
            {notificationTestStatus && (
              <span className="text-xs text-purple-300">{notificationTestStatus}</span>
            )}
          </div>
        </div>

        {/* Danger zone: Reset Save */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Reset Progres Game
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300">Yakin hapus semua data?</span>
              <button
                onClick={() => {
                  onResetSave();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold cursor-pointer"
              >
                Ya, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
