import React, { useRef, useEffect } from 'react';
import type { BiomeId, ShrinePuzzleData } from '../game/types.ts';
import { BIOMES, SHRINE_PUZZLES, WORLD_CHESTS } from '../game/worldData.ts';
import { sound } from '../game/audio.ts';

interface GameCanvasProps {
  currentBiome: BiomeId;
  playerPos: { x: number; y: number };
  solvedShrines: string[];
  collectedChests: string[];
  onPlayerMove: (newX: number, newY: number) => void;
  onNearShrine: (shrine: ShrinePuzzleData | null) => void;
  onNearChest: (chest: typeof WORLD_CHESTS[0] | null) => void;
  onSwitchBiome: (newBiome: BiomeId) => void;
  isPaused: boolean;
  theme: string;
}

const WORLD_WIDTH = 24;
const WORLD_HEIGHT = 18;
const TILE_SIZE = 48;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentBiome,
  playerPos,
  solvedShrines,
  collectedChests,
  onPlayerMove,
  onNearShrine,
  onNearChest,
  onSwitchBiome,
  isPaused,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store live callbacks & state in refs to prevent re-instantiating the loop
  const stateRef = useRef({
    currentBiome,
    playerX: playerPos.x,
    playerY: playerPos.y,
    targetX: playerPos.x,
    targetY: playerPos.y,
    solvedShrines,
    collectedChests,
    isPaused,
    theme,
  });

  // Keep stateRef in sync with React props
  useEffect(() => {
    stateRef.current.currentBiome = currentBiome;
    stateRef.current.playerX = playerPos.x;
    stateRef.current.playerY = playerPos.y;
    stateRef.current.solvedShrines = solvedShrines;
    stateRef.current.collectedChests = collectedChests;
    stateRef.current.isPaused = isPaused;
    stateRef.current.theme = theme;
  }, [currentBiome, playerPos, solvedShrines, collectedChests, isPaused, theme]);

  const callbacksRef = useRef({
    onPlayerMove,
    onNearShrine,
    onNearChest,
    onSwitchBiome,
  });
  useEffect(() => {
    callbacksRef.current = { onPlayerMove, onNearShrine, onNearChest, onSwitchBiome };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Input tracking
    const keysPressed = new Set<string>();
    let moveCooldown = 0;

    // Ambient floating particles
    interface AmbientParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }
    const particles: AmbientParticle[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * (WORLD_WIDTH * TILE_SIZE),
        y: Math.random() * (WORLD_HEIGHT * TILE_SIZE),
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 15,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        color: '#67e8f9',
      });
    }

    // Portal locations between biomes
    const portals = [
      { x: 2, y: 2, targetBiome: 'verdant' as BiomeId, label: 'Portal Zamrud' },
      { x: 21, y: 2, targetBiome: 'crystal' as BiomeId, label: 'Portal Kristal' },
      { x: 2, y: 15, targetBiome: 'sunken' as BiomeId, label: 'Portal Samudra' },
      { x: 21, y: 15, targetBiome: 'sky' as BiomeId, label: 'Portal Angkasa' },
      { x: 12, y: 1, targetBiome: 'volcanic' as BiomeId, label: 'Portal Kawah' },
    ];

    const executeStep = (dx: number, dy: number) => {
      const state = stateRef.current;
      if (state.isPaused) return;

      const nextX = Math.max(1, Math.min(WORLD_WIDTH - 2, Math.round(state.playerX + dx)));
      const nextY = Math.max(1, Math.min(WORLD_HEIGHT - 2, Math.round(state.playerY + dy)));

      if (nextX !== state.playerX || nextY !== state.playerY) {
        state.playerX = nextX;
        state.playerY = nextY;
        sound.playStep();
        callbacksRef.current.onPlayerMove(nextX, nextY);

        // Check near portals
        const portalHit = portals.find((p) => p.x === nextX && p.y === nextY && p.targetBiome !== state.currentBiome);
        if (portalHit) {
          sound.playRuneTone(1.4);
          callbacksRef.current.onSwitchBiome(portalHit.targetBiome);
        }
      }
    };

    // Handle Keyboard with immediate edge trigger
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (!keysPressed.has(e.code)) {
        keysPressed.add(e.code);
        // Instant edge-triggered move on press!
        let dx = 0;
        let dy = 0;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') dy -= 1;
        else if (e.code === 'KeyS' || e.code === 'ArrowDown') dy += 1;
        else if (e.code === 'KeyA' || e.code === 'ArrowLeft') dx -= 1;
        else if (e.code === 'KeyD' || e.code === 'ArrowRight') dx += 1;

        if (dx !== 0 || dy !== 0) {
          executeStep(dx, dy);
          moveCooldown = 0.2;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
    };

    const handleBlur = () => {
      keysPressed.clear();
    };

    // Canvas click to move directly towards clicked tile
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cameraX = canvas.width / 2 - stateRef.current.playerX * TILE_SIZE;
      const cameraY = canvas.height / 2 - stateRef.current.playerY * TILE_SIZE;

      const worldClickX = (clickX - cameraX) / TILE_SIZE;
      const worldClickY = (clickY - cameraY) / TILE_SIZE;

      const dx = Math.sign(worldClickX - stateRef.current.playerX);
      const dy = Math.sign(worldClickY - stateRef.current.playerY);

      if (Math.abs(worldClickX - stateRef.current.playerX) > Math.abs(worldClickY - stateRef.current.playerY)) {
        executeStep(dx, 0);
      } else {
        executeStep(0, dy);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Responsive Canvas Resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Main 60 FPS Game Loop
    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const state = stateRef.current;
      const biomeInfo = BIOMES[state.currentBiome] || BIOMES.verdant;

      if (!state.isPaused) {
        // Player Movement Logic with smooth grid stepping
        moveCooldown -= dt;
        if (moveCooldown <= 0) {
          let dx = 0;
          let dy = 0;

          if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) dy -= 1;
          else if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) dy += 1;
          else if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) dx -= 1;
          else if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) dx += 1;

          if (dx !== 0 || dy !== 0) {
            const nextX = Math.max(1, Math.min(WORLD_WIDTH - 2, Math.round(state.playerX + dx)));
            const nextY = Math.max(1, Math.min(WORLD_HEIGHT - 2, Math.round(state.playerY + dy)));

            if (nextX !== state.playerX || nextY !== state.playerY) {
              state.playerX = nextX;
              state.playerY = nextY;
              moveCooldown = 0.16; // smooth 160ms step cadence
              sound.playStep();
              callbacksRef.current.onPlayerMove(nextX, nextY);

              // Check near portals
              const portalHit = portals.find((p) => p.x === nextX && p.y === nextY && p.targetBiome !== state.currentBiome);
              if (portalHit) {
                sound.playRuneTone(1.4);
                callbacksRef.current.onSwitchBiome(portalHit.targetBiome);
              }
            }
          }
        }

        // Proximity checks for Shrines and Chests
        const curShrines = SHRINE_PUZZLES.filter((s) => s.biomeId === state.currentBiome);
        const nearShrine = curShrines.find((s) => {
          const shrineX = s.type === 'mirror_beam' ? 6 : s.type === 'megalith_plates' ? 12 : 18;
          const shrineY = s.type === 'mirror_beam' ? 7 : s.type === 'megalith_plates' ? 9 : 7;
          return Math.abs(state.playerX - shrineX) <= 1 && Math.abs(state.playerY - shrineY) <= 1;
        });

        const curChests = WORLD_CHESTS.filter((c) => c.biomeId === state.currentBiome);
        const nearChest = curChests.find((c) => Math.abs(state.playerX - c.x) <= 1 && Math.abs(state.playerY - c.y) <= 1);

        callbacksRef.current.onNearShrine(nearShrine || null);
        callbacksRef.current.onNearChest(nearChest || null);

        // Update ambient particles
        for (const p of particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y < 0) {
            p.y = WORLD_HEIGHT * TILE_SIZE;
            p.x = Math.random() * (WORLD_WIDTH * TILE_SIZE);
          }
        }
      }

      // --- RENDERING ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Camera centered on player
      const cameraX = canvas.width / 2 - state.playerX * TILE_SIZE;
      const cameraY = canvas.height / 2 - state.playerY * TILE_SIZE;

      ctx.save();
      ctx.translate(Math.round(cameraX), Math.round(cameraY));

      // 1. Draw World Ground Tiles
      const isContrast = state.theme === 'contrast';
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
          const isBorder = x === 0 || x === WORLD_WIDTH - 1 || y === 0 || y === WORLD_HEIGHT - 1;
          const tileX = x * TILE_SIZE;
          const tileY = y * TILE_SIZE;

          if (isBorder) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#1e293b';
            ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
          } else {
            // Subtle biome tint
            const checker = (x + y) % 2 === 0;
            ctx.fillStyle = checker ? '#090d16' : '#0b1120';
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

            // Subtle biome grid dots
            ctx.fillStyle = isContrast ? '#334155' : `rgba(${biomeInfo.bgRgb}, 0.08)`;
            ctx.fillRect(tileX + 22, tileY + 22, 4, 4);
          }
        }
      }

      // 2. Draw Portals between Biomes
      for (const portal of portals) {
        const px = portal.x * TILE_SIZE;
        const py = portal.y * TILE_SIZE;
        const isCurrent = portal.targetBiome === state.currentBiome;

        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 22, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? 'rgba(56, 189, 248, 0.1)' : 'rgba(168, 85, 247, 0.25)';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? '#38bdf8' : '#c084fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌀', px + TILE_SIZE / 2, py + TILE_SIZE / 2);
      }

      // 3. Draw Shrines in current Biome
      const curShrines = SHRINE_PUZZLES.filter((s) => s.biomeId === state.currentBiome);
      for (const shrine of curShrines) {
        const sx = (shrine.type === 'mirror_beam' ? 6 : shrine.type === 'megalith_plates' ? 12 : 18) * TILE_SIZE;
        const sy = (shrine.type === 'mirror_beam' ? 7 : shrine.type === 'megalith_plates' ? 9 : 7) * TILE_SIZE;
        const isSolved = state.solvedShrines.includes(shrine.id);

        // Shrine Pedestal
        ctx.fillStyle = isSolved ? '#064e3b' : '#1e1b4b';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = isSolved ? '#34d399' : '#818cf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);

        // Shrine Aura Glow
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2, 32, 0, Math.PI * 2);
        ctx.fillStyle = isSolved ? 'rgba(52, 211, 153, 0.15)' : 'rgba(129, 140, 248, 0.2)';
        ctx.fill();

        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isSolved ? '✨' : '⛩️', sx + TILE_SIZE / 2, sy + TILE_SIZE / 2);

        // Name tag
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(shrine.name.slice(0, 16), sx + TILE_SIZE / 2, sy - 8);
      }

      // 4. Draw Chests
      const curChests = WORLD_CHESTS.filter((c) => c.biomeId === state.currentBiome);
      for (const chest of curChests) {
        const cx = chest.x * TILE_SIZE;
        const cy = chest.y * TILE_SIZE;
        const isCollected = state.collectedChests.includes(chest.id);

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isCollected ? '📭' : '🎁', cx + TILE_SIZE / 2, cy + TILE_SIZE / 2);
      }

      // 5. Draw Ambient Floating Particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = biomeInfo.accent;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 6. Draw Player Character
      const px = state.playerX * TILE_SIZE;
      const py = state.playerY * TILE_SIZE;

      // Soft light lantern halo
      const grad = ctx.createRadialGradient(
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        10,
        px + TILE_SIZE / 2,
        py + TILE_SIZE / 2,
        70
      );
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 70, 0, Math.PI * 2);
      ctx.fill();

      // Player Body Sprite
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧙', px + TILE_SIZE / 2, py + TILE_SIZE / 2);

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#090d16]">
      <canvas ref={canvasRef} className="w-full h-full block focus:outline-none" tabIndex={0} />
    </div>
  );
};
