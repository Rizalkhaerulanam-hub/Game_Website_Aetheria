/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { BiomeId, ShrinePuzzleData, PlayerSaveData, PlayerInventoryItem } from './game/types.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { PuzzleModal } from './components/PuzzleModal.tsx';
import { AdSenseModal } from './components/AdSenseModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { CloudSyncModal } from './components/CloudSyncModal.tsx';
import { ProfileAnalyticsModal } from './components/ProfileAnalyticsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { InventoryModal } from './components/InventoryModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { sound } from './game/audio.ts';
import { calculateMasteryScore, calculateLevelFromScore } from './game/puzzleLogic.ts';
import { encryptSaveData, decryptSaveData } from './game/encryption.ts';
import { WORLD_CHESTS, SHRINE_PUZZLES } from './game/worldData.ts';

const SAVE_KEY = 'aetheria_savedata_v2';

const createDefaultSaveData = (): PlayerSaveData => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    version: 2,
    playerId: `hero_${Date.now()}_${randomSuffix}`,
    playerName: `Pengelana ${randomSuffix}`,
    playerLevel: 1,
    relicScore: 0,
    staminaMax: 100,
    currentBiome: 'verdant',
    playerX: 10,
    playerY: 8,
    solvedPuzzleIds: [],
    collectedChestIds: [],
    inventory: [
      {
        id: 'starting_journal',
        name: 'Buku Catatan Kuno',
        type: 'relic',
        description: 'Jurnal peninggalan leluhur berisi sketsa kuil cahaya dan teka-teki rune.',
        rarity: 'common',
        icon: '📜',
        count: 1,
      },
    ],
    stats: {
      stepsTaken: 0,
      puzzlesSolved: 0,
      relicsDiscovered: 1,
      totalPlayTimeSec: 0,
      adImpressionsWatched: 0,
      rewardedBonusPoints: 0,
      dailyStreak: 1,
      lastDailyDate: new Date().toISOString().slice(0, 10),
      shrineSolvesByType: {
        mirror_beam: 0,
        megalith_plates: 0,
        harmonic_sequence: 0,
      },
      biomeExplorationPct: {
        verdant: 10,
        crystal: 0,
        sunken: 0,
        sky: 0,
        volcanic: 0,
      },
    },
    settings: {
      theme: 'dark',
      soundMuted: false,
      soundVolume: 0.8,
      accessibleColors: true,
      largeFont: false,
      highContrast: false,
      pushNotificationEnabled: false,
      dailyReminderTime: '19:00',
      googleAdSenseClientId: '',
      googleAdSlotId: '',
    },
    updatedAt: Date.now(),
  };
};

export default function App() {
  // Game State Machine: 'title' | 'playing' | 'paused'
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>('title');

  // Load save data from localStorage with tamper check fallback
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const decrypted = decryptSaveData<PlayerSaveData>(stored);
        if (decrypted.success && decrypted.data) {
          return decrypted.data;
        }
      }
    } catch {}
    return createDefaultSaveData();
  });

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'puzzle' | 'adsense' | 'leaderboard' | 'cloud' | 'profile' | 'settings' | 'inventory' | 'pause'
  >('none');

  const [activeShrine, setActiveShrine] = useState<ShrinePuzzleData | null>(null);
  const [activeChest, setActiveChest] = useState<typeof WORLD_CHESTS[0] | null>(null);
  const activeShrineRef = useRef<ShrinePuzzleData | null>(null);
  const activeChestRef = useRef<typeof WORLD_CHESTS[0] | null>(null);

  const handleNearShrine = useCallback((shrine: ShrinePuzzleData | null) => {
    setActiveShrine((prev) => (prev?.id === shrine?.id ? prev : shrine));
  }, []);

  const handleNearChest = useCallback((chest: typeof WORLD_CHESTS[0] | null) => {
    setActiveChest((prev) => (prev?.id === chest?.id ? prev : chest));
  }, []);

  useEffect(() => {
    activeShrineRef.current = activeShrine;
    activeChestRef.current = activeChest;
  }, [activeShrine, activeChest]);

  const [buffMultiplierUntil, setBuffMultiplierUntil] = useState<number>(0);

  // Online / Offline tracking
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync state machine with body attribute
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Handle ?autostart=1 query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
    }
  }, []);

  // Online/Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Playtime accumulator
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState === 'playing' && activeModal === 'none') {
        setSaveData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalPlayTimeSec: prev.stats.totalPlayTimeSec + 1,
          },
        }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, activeModal]);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      const encrypted = encryptSaveData(saveData);
      localStorage.setItem(SAVE_KEY, encrypted);
    } catch {}
  }, [saveData]);

  // Dynamically load official Google AdSense script when Client ID is configured
  useEffect(() => {
    const clientId = saveData.settings.googleAdSenseClientId;
    if (clientId && clientId.startsWith('ca-pub-')) {
      const existingScript = document.getElementById('google-adsense-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-adsense-script';
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    }
  }, [saveData.settings.googleAdSenseClientId]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        // Toggle Mute
        const nextMuted = !saveData.settings.soundMuted;
        sound.setMuted(nextMuted);
        setSaveData((prev) => ({
          ...prev,
          settings: { ...prev.settings, soundMuted: nextMuted },
        }));
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'playing') {
          if (activeModal !== 'none') {
            setActiveModal('none');
          } else {
            setGameState('paused');
            setActiveModal('pause');
          }
        } else if (gameState === 'paused') {
          setGameState('playing');
          setActiveModal('none');
        }
      } else if (e.code === 'Space' && gameState === 'playing' && activeModal === 'none') {
        if (activeShrineRef.current) {
          e.preventDefault();
          setActiveModal('puzzle');
        } else if (activeChestRef.current) {
          e.preventDefault();
          handleCollectChest(activeChestRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeModal, activeShrine, activeChest, saveData.settings.soundMuted]);

  // Start game handler
  const handleStartGame = () => {
    sound.setMuted(saveData.settings.soundMuted);
    setGameState('playing');
    setActiveModal('none');
  };

  // Player movement
  const handlePlayerMove = (x: number, y: number) => {
    setSaveData((prev) => {
      const nextSteps = prev.stats.stepsTaken + 1;
      const newScore = calculateMasteryScore(
        prev.stats.puzzlesSolved,
        prev.stats.relicsDiscovered,
        nextSteps,
        prev.stats.rewardedBonusPoints
      );
      const { level } = calculateLevelFromScore(newScore);

      return {
        ...prev,
        playerX: x,
        playerY: y,
        playerLevel: level,
        relicScore: newScore,
        stats: {
          ...prev.stats,
          stepsTaken: nextSteps,
        },
      };
    });
  };

  // Chest collection
  const handleCollectChest = (chest: typeof WORLD_CHESTS[0]) => {
    if (saveData.collectedChestIds.includes(chest.id)) return;

    sound.playRelicPickup();
    setSaveData((prev) => {
      const newItem: PlayerInventoryItem = {
        id: chest.id,
        name: chest.relic,
        type: 'relic',
        description: chest.lore,
        rarity: 'rare',
        icon: '💎',
        count: 1,
      };

      const updatedDiscovered = prev.stats.relicsDiscovered + 1;
      const newScore = calculateMasteryScore(
        prev.stats.puzzlesSolved,
        updatedDiscovered,
        prev.stats.stepsTaken,
        prev.stats.rewardedBonusPoints
      );
      const { level } = calculateLevelFromScore(newScore);

      return {
        ...prev,
        collectedChestIds: [...prev.collectedChestIds, chest.id],
        inventory: [...prev.inventory, newItem],
        relicScore: newScore,
        playerLevel: level,
        stats: {
          ...prev.stats,
          relicsDiscovered: updatedDiscovered,
        },
      };
    });
    setActiveChest(null);
  };

  // Puzzle Solved Callback
  const handlePuzzleSolved = (shrineId: string, relicName: string, exp: number) => {
    const isMultiplierActive = Date.now() < buffMultiplierUntil;
    const effectiveExp = isMultiplierActive ? exp * 2 : exp;

    setSaveData((prev) => {
      if (prev.solvedPuzzleIds.includes(shrineId)) return prev;

      const updatedSolved = [...prev.solvedPuzzleIds, shrineId];
      const count = prev.stats.puzzlesSolved + 1;
      const bonus = prev.stats.rewardedBonusPoints + effectiveExp;
      const newScore = calculateMasteryScore(count, prev.stats.relicsDiscovered, prev.stats.stepsTaken, bonus);
      const { level } = calculateLevelFromScore(newScore);

      const newRelic: PlayerInventoryItem = {
        id: `shrine_reward_${shrineId}`,
        name: relicName,
        type: 'relic',
        description: `Artefak langka yang dianugerahkan oleh ${activeShrine?.name || 'Kuil Kuno'}.`,
        rarity: 'epic',
        icon: '🌟',
        count: 1,
      };

      return {
        ...prev,
        solvedPuzzleIds: updatedSolved,
        inventory: [...prev.inventory, newRelic],
        relicScore: newScore,
        playerLevel: level,
        stats: {
          ...prev.stats,
          puzzlesSolved: count,
          rewardedBonusPoints: bonus,
        },
      };
    });

    // Submit score to global leaderboard in background
    if (navigator.onLine) {
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: saveData.playerId,
          playerName: saveData.playerName,
          score: saveData.relicScore + effectiveExp,
          level: saveData.playerLevel,
          puzzlesSolved: saveData.stats.puzzlesSolved + 1,
          relicsFound: saveData.stats.relicsDiscovered,
          currentBiome: saveData.currentBiome,
        }),
      }).catch(() => {});
    }
  };

  // Ad Reward Claimed
  const handleRewardClaimed = (rewardType: 'bonus_score' | 'double_buff' | 'shrine_hint') => {
    if (rewardType === 'bonus_score') {
      setSaveData((prev) => {
        const bonus = prev.stats.rewardedBonusPoints + 1000;
        const newScore = calculateMasteryScore(
          prev.stats.puzzlesSolved,
          prev.stats.relicsDiscovered,
          prev.stats.stepsTaken,
          bonus
        );
        return {
          ...prev,
          relicScore: newScore,
          stats: {
            ...prev.stats,
            adImpressionsWatched: prev.stats.adImpressionsWatched + 1,
            rewardedBonusPoints: bonus,
          },
        };
      });
    } else if (rewardType === 'double_buff') {
      setBuffMultiplierUntil(Date.now() + 15 * 60 * 1000); // 15 mins
      setSaveData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          adImpressionsWatched: prev.stats.adImpressionsWatched + 1,
        },
      }));
    } else {
      setSaveData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          adImpressionsWatched: prev.stats.adImpressionsWatched + 1,
        },
      }));
    }

    // Telemetry log to server
    if (navigator.onLine) {
      fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'ad_watched',
          playerId: saveData.playerId,
          details: { rewardType },
        }),
      }).catch(() => {});
    }
  };

  const currentTheme = saveData.settings.theme;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden font-sans select-none ${
        currentTheme === 'emerald'
          ? 'bg-[#061e14] text-emerald-100'
          : currentTheme === 'cyber'
          ? 'bg-[#0f0c1b] text-purple-100'
          : currentTheme === 'contrast'
          ? 'bg-black text-white'
          : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* 1. Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenAdSense={() => setActiveModal('adsense')}
          onOpenCloudSync={() => setActiveModal('cloud')}
          highScore={saveData.relicScore}
        />
      )}

      {/* 2. Playing State: 60fps Canvas & World-matched Low-Occlusion HUD */}
      {gameState !== 'title' && (
        <>
          <GameCanvas
            currentBiome={saveData.currentBiome}
            playerPos={{ x: saveData.playerX, y: saveData.playerY }}
            solvedShrines={saveData.solvedPuzzleIds}
            collectedChests={saveData.collectedChestIds}
            onPlayerMove={handlePlayerMove}
            onNearShrine={handleNearShrine}
            onNearChest={handleNearChest}
            onSwitchBiome={(newBiome) => setSaveData((prev) => ({ ...prev, currentBiome: newBiome }))}
            isPaused={gameState === 'paused' || activeModal !== 'none'}
            theme={currentTheme}
          />

          <HUD
            playerLevel={saveData.playerLevel}
            relicScore={saveData.relicScore}
            currentBiome={saveData.currentBiome}
            soundMuted={saveData.settings.soundMuted}
            onToggleSound={() => {
              const nextMuted = !saveData.settings.soundMuted;
              sound.setMuted(nextMuted);
              setSaveData((prev) => ({
                ...prev,
                settings: { ...prev.settings, soundMuted: nextMuted },
              }));
            }}
            onOpenPause={() => {
              setGameState('paused');
              setActiveModal('pause');
            }}
            onOpenLeaderboard={() => setActiveModal('leaderboard')}
            onOpenAdSense={() => setActiveModal('adsense')}
            onOpenInventory={() => setActiveModal('inventory')}
            onOpenCloudSync={() => setActiveModal('cloud')}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenSettings={() => setActiveModal('settings')}
            isOnline={isOnline}
            dailyStreak={saveData.stats.dailyStreak}
            interactPrompt={
              activeShrine
                ? `Tekan [SPASI] Buka ${activeShrine.name}`
                : activeChest && !saveData.collectedChestIds.includes(activeChest.id)
                ? `Tekan [SPASI] Buka Peti (${activeChest.relic})`
                : null
            }
            onInteract={() => {
              if (activeShrine) setActiveModal('puzzle');
              else if (activeChest) handleCollectChest(activeChest);
            }}
            onMoveButton={(dx, dy) => {
              handlePlayerMove(
                Math.max(1, Math.min(22, saveData.playerX + dx)),
                Math.max(1, Math.min(16, saveData.playerY + dy))
              );
            }}
            buffMultiplierActive={Date.now() < buffMultiplierUntil}
          />
        </>
      )}

      {/* 3. Interactive Modals */}
      {activeModal === 'puzzle' && activeShrine && (
        <PuzzleModal
          shrine={activeShrine}
          isOpen={true}
          onClose={() => setActiveModal('none')}
          onSolved={handlePuzzleSolved}
          isAlreadySolved={saveData.solvedPuzzleIds.includes(activeShrine.id)}
        />
      )}

      {activeModal === 'adsense' && (
        <AdSenseModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          adSenseClientId={saveData.settings.googleAdSenseClientId}
          adSlotId={saveData.settings.googleAdSlotId}
          onUpdateAdSenseConfig={(clientId, slotId) => {
            setSaveData((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                googleAdSenseClientId: clientId,
                googleAdSlotId: slotId,
              },
            }));
          }}
          onRewardClaimed={handleRewardClaimed}
          adImpressionsCount={saveData.stats.adImpressionsWatched}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          currentPlayerId={saveData.playerId}
          currentPlayerName={saveData.playerName}
          currentScore={saveData.relicScore}
        />
      )}

      {activeModal === 'cloud' && (
        <CloudSyncModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          currentSaveData={saveData}
          onRestoreSaveData={(restored) => {
            setSaveData(restored);
          }}
        />
      )}

      {activeModal === 'profile' && (
        <ProfileAnalyticsModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          saveData={saveData}
          onUpdatePlayerName={(newName) => {
            setSaveData((prev) => ({ ...prev, playerName: newName }));
          }}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          inventory={saveData.inventory}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          isOpen={true}
          onClose={() => setActiveModal('none')}
          settings={saveData.settings}
          onUpdateSettings={(newPartial) => {
            setSaveData((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...newPartial },
            }));
          }}
          onResetSave={() => {
            const fresh = createDefaultSaveData();
            setSaveData(fresh);
            setActiveModal('none');
          }}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          isOpen={true}
          onResume={() => {
            setGameState('playing');
            setActiveModal('none');
          }}
          onRestart={() => {
            setSaveData((prev) => ({
              ...prev,
              playerX: 10,
              playerY: 8,
              currentBiome: 'verdant',
            }));
            setGameState('playing');
            setActiveModal('none');
          }}
          onOpenSettings={() => setActiveModal('settings')}
          onReturnTitle={() => {
            setGameState('title');
            setActiveModal('none');
          }}
          score={saveData.relicScore}
          puzzlesCount={saveData.stats.puzzlesSolved}
        />
      )}
    </div>
  );
}
