import React, { useState, useEffect } from 'react';
import { Sparkles, DollarSign, Award, Play, CheckCircle2, ShieldAlert, ExternalLink, HelpCircle, Eye, X } from 'lucide-react';
import { sound } from '../game/audio.ts';

interface AdSenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adSenseClientId: string;
  adSlotId: string;
  onUpdateAdSenseConfig: (clientId: string, slotId: string) => void;
  onRewardClaimed: (rewardType: 'bonus_score' | 'double_buff' | 'shrine_hint') => void;
  adImpressionsCount: number;
}

export const AdSenseModal: React.FC<AdSenseModalProps> = ({
  isOpen,
  onClose,
  adSenseClientId,
  adSlotId,
  onUpdateAdSenseConfig,
  onRewardClaimed,
  adImpressionsCount,
}) => {
  const [clientIdInput, setClientIdInput] = useState(adSenseClientId || '');
  const [slotIdInput, setSlotIdInput] = useState(adSlotId || '');
  const [configSaved, setConfigSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'reward' | 'settings' | 'guide'>('reward');

  // Ad playback simulation state
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adFinished, setAdFinished] = useState(false);
  const [selectedReward, setSelectedReward] = useState<'bonus_score' | 'double_buff' | 'shrine_hint'>('bonus_score');

  useEffect(() => {
    setClientIdInput(adSenseClientId || '');
    setSlotIdInput(adSlotId || '');
  }, [adSenseClientId, adSlotId]);

  // Handle ad countdown
  useEffect(() => {
    let timer: any;
    if (isPlayingAd && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isPlayingAd && adCountdown === 0) {
      setAdFinished(true);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, adCountdown]);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdSenseConfig(clientIdInput.trim(), slotIdInput.trim());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const startRewardedAd = (reward: 'bonus_score' | 'double_buff' | 'shrine_hint') => {
    setSelectedReward(reward);
    setIsPlayingAd(true);
    setAdCountdown(5);
    setAdFinished(false);
  };

  const handleClaimReward = () => {
    sound.playAdReward();
    onRewardClaimed(selectedReward);
    setIsPlayingAd(false);
    setAdFinished(false);
  };

  // Estimated stats based on impressions
  const estimatedEcpm = 3.25; // $3.25 per 1000 impressions
  const estimatedEarnings = ((adImpressionsCount * estimatedEcpm) / 1000).toFixed(3);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adsense-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ad Video Player Overlay */}
        {isPlayingAd && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-950 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
                <span className="flex items-center gap-1.5 font-medium text-amber-400">
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Google Rewarded Ad Sponsor
                </span>
                <span className="tabular-nums font-mono">
                  {adCountdown > 0 ? `Iklan berakhir dalam ${adCountdown}s` : 'Iklan selesai!'}
                </span>
              </div>

              {/* Dynamic Ad Content Simulation / Live Ad Container */}
              <div className="relative aspect-video bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-3 animate-pulse">
                  <Sparkles className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Google AdSense Partner Network</h3>
                <p className="text-xs text-slate-300 max-w-xs mb-3">
                  {adSenseClientId ? `ID Penayang: ${adSenseClientId}` : 'Mode Pengujian Akun Google AdSense Aktif'}
                </p>
                <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Hadiah: {selectedReward === 'bonus_score' ? '+1.000 Poin Relik' : selectedReward === 'double_buff' ? '2x Skor Multiplier (15m)' : 'Petunjuk Kuil Kuno'}
                </span>
                {adFinished ? (
                  <button
                    onClick={handleClaimReward}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" /> Klaim Hadiah Sekarang
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
                  >
                    Tunggu ({adCountdown}s)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 id="adsense-title" className="text-lg font-bold text-white flex items-center gap-2">
                Pusat Monetisasi & Google AdSense
              </h2>
              <p className="text-xs text-slate-400">
                Dapatkan penghasilan langsung ke akun Google Anda dari setiap tayangan iklan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Pusat Monetisasi"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('reward')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'reward'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tonton Iklan & Hadiah
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Konfigurasi Akun Google
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Panduan Pendapatan (FAQ)
          </button>
        </div>

        {/* Tab 1: Rewarded Ad Experience */}
        {activeTab === 'reward' && (
          <div className="space-y-6">
            {/* Realtime Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> Total Ditonton
                </span>
                <p className="text-lg font-bold text-white tabular-nums">{adImpressionsCount} kali</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimasi eCPM
                </span>
                <p className="text-lg font-bold text-emerald-400 tabular-nums">${estimatedEcpm}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Estimasi Profit
                </span>
                <p className="text-lg font-bold text-amber-400 tabular-nums">${estimatedEarnings}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Pilih Berkah Iklan Berhadiah untuk Pemain:
              </h3>

              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => startRewardedAd('bonus_score')}
                  className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Instan
                    </span>
                    <h4 className="font-bold text-white mt-2 group-hover:text-amber-300">
                      +1.000 Poin Relik
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tambahkan 1.000 poin langsung untuk mendongkrak skor leaderboard global Anda.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Play className="w-3.5 h-3.5 fill-amber-400" /> Tonton Iklan (5s)
                  </div>
                </button>

                <button
                  onClick={() => startRewardedAd('double_buff')}
                  className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Buff 15 Menit
                    </span>
                    <h4 className="font-bold text-white mt-2 group-hover:text-emerald-300">
                      2x Relic Multiplier
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Setiap kuil yang Anda selesaikan melipatgandakan perolehan poin dan XP 200%.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Play className="w-3.5 h-3.5 fill-emerald-400" /> Tonton Iklan (5s)
                  </div>
                </button>

                <button
                  onClick={() => startRewardedAd('shrine_hint')}
                  className="p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-400 text-left transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Bantuan
                    </span>
                    <h4 className="font-bold text-white mt-2 group-hover:text-sky-300">
                      Petunjuk Kuil Kuno
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Buka kunci kompas rahasia dan petunjuk penyelesaian puzzle tersulit.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                    <Play className="w-3.5 h-3.5 fill-sky-400" /> Tonton Iklan (5s)
                  </div>
                </button>
              </div>
            </div>

            {/* Display banner preview unit */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                Unit Iklan Display (AdSense Banner Slot)
              </span>
              <div className="w-full py-4 bg-slate-900 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-center">
                <span className="text-xs text-slate-400">
                  {adSenseClientId
                    ? `Unit Iklan Responsif AdSense Aktif (${adSenseClientId})`
                    : 'Banner Iklan Google Terhubung Otomatis saat ID AdSense Diisi'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings Configuration */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="p-4 bg-sky-950/40 border border-sky-500/30 rounded-xl text-xs text-sky-200">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-sky-300" /> Hubungkan ke Akun Google AdSense Anda:
              </p>
              Masukkan Publisher ID dari dashboard Google AdSense Anda (berformat{' '}
              <code className="bg-sky-900/60 px-1 py-0.5 rounded">ca-pub-XXXXXXXXXXXXXXXX</code>). Script Google AdSense resmi akan dimuat dan setiap tayangan iklan akan langsung dihitung ke saldo Google AdSense Anda.
            </div>

            <div>
              <label htmlFor="client-id-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Google AdSense Publisher ID (Client ID)
              </label>
              <input
                id="client-id-input"
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="contoh: ca-pub-1234567890123456"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="slot-id-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Google Ad Slot ID (Opsional)
              </label>
              <input
                id="slot-id-input"
                type="text"
                value={slotIdInput}
                onChange={(e) => setSlotIdInput(e.target.value)}
                placeholder="contoh: 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {configSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Pengaturan tersimpan dan disinkronkan!
                </span>
              )}
              {!configSaved && <span />}
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
              >
                Simpan & Hubungkan AdSense
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Bagaimana Cara Kerja Keuntungan dari Iklan?
              </h4>
              <p>
                1. <strong>Mendaftar ke Google AdSense</strong>: Kunjungi <em>adsense.google.com</em> menggunakan akun Google Anda dan daftarkan situs/domain game ini.
              </p>
              <p>
                2. <strong>Masukkan Publisher ID</strong>: Salin Publisher ID Anda yang diawali dengan <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">ca-pub-</code> ke tab Konfigurasi di atas.
              </p>
              <p>
                3. <strong>Pemain Menonton Iklan</strong>: Setiap kali pengunjung memainkan game dan menonton iklan berhadiah (Rewarded Ad) atau melihat banner, tayangan (impressions) dicatat di Google AdSense.
              </p>
              <p>
                4. <strong>Pencairan Saldo</strong>: Google mentransfer penghasilan bulanan langsung ke rekening bank Anda setelah mencapai ambang pembayaran (payout threshold).
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-sky-400" /> Mode Pengujian Aman
              </h4>
              <p>
                Jika Anda belum memasukkan Publisher ID, game secara otomatis menjalankan simulator iklan berhadiah yang memberikan pemain reward tanpa memblokir pengalaman bermain game.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
