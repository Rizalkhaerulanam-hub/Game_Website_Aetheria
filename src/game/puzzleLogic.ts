import type { MirrorCell, MegalithCell, ShrinePuzzleData, BiomeId } from './types.ts';

export interface BeamStep {
  x: number;
  y: number;
  dir: 'north' | 'east' | 'south' | 'west';
}

/**
 * Calculates the path of a light beam across the mirror puzzle grid.
 * Returns the array of beam steps and whether the target receiver is activated.
 */
export function calculateBeamPath(
  cols: number,
  rows: number,
  cells: MirrorCell[]
): { path: BeamStep[]; receiverActivated: boolean; hitCells: Set<string> } {
  // Find emitter
  const emitter = cells.find((c) => c.type === 'emitter');
  if (!emitter || !emitter.direction) {
    return { path: [], receiverActivated: false, hitCells: new Set() };
  }

  // Create cell lookup map
  const cellMap = new Map<string, MirrorCell>();
  cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

  const path: BeamStep[] = [];
  const hitCells = new Set<string>();

  let curX = emitter.x;
  let curY = emitter.y;
  let curDir = emitter.direction;
  let receiverActivated = false;

  const maxSteps = cols * rows * 2;
  const visitedState = new Set<string>();

  for (let step = 0; step < maxSteps; step++) {
    // Step forward in current direction
    if (curDir === 'north') curY -= 1;
    else if (curDir === 'south') curY += 1;
    else if (curDir === 'east') curX += 1;
    else if (curDir === 'west') curX -= 1;

    // Check bounds
    if (curX < 0 || curX >= cols || curY < 0 || curY >= rows) {
      break;
    }

    const stateKey = `${curX},${curY},${curDir}`;
    if (visitedState.has(stateKey)) {
      // Loop detected
      break;
    }
    visitedState.add(stateKey);

    path.push({ x: curX, y: curY, dir: curDir });
    hitCells.add(`${curX},${curY}`);

    const cell = cellMap.get(`${curX},${curY}`);
    if (!cell) continue;

    if (cell.type === 'wall') {
      break;
    }

    if (cell.type === 'receiver') {
      // Receiver activates if beam arrives from opposite direction of receiver facing or any valid angle
      receiverActivated = true;
      break;
    }

    if (cell.type === 'mirror') {
      const angle = cell.mirrorAngle || '/';
      if (angle === '/') {
        // '/' deflects:
        // north -> east
        // south -> west
        // east -> north
        // west -> south
        if (curDir === 'north') curDir = 'east';
        else if (curDir === 'south') curDir = 'west';
        else if (curDir === 'east') curDir = 'north';
        else if (curDir === 'west') curDir = 'south';
      } else if (angle === '\\') {
        // '\' deflects:
        // north -> west
        // south -> east
        // east -> south
        // west -> north
        if (curDir === 'north') curDir = 'west';
        else if (curDir === 'south') curDir = 'east';
        else if (curDir === 'east') curDir = 'south';
        else if (curDir === 'west') curDir = 'north';
      }
    }
  }

  return { path, receiverActivated, hitCells };
}

/**
 * Checks if Megalith / Sokoban plate puzzle is solved (all plates have a stone)
 */
export function checkMegalithSolved(cells: MegalithCell[]): boolean {
  const plateCount = cells.filter((c) => c.type === 'plate' || c.type === 'stone_on_plate').length;
  if (plateCount === 0) return false;
  const stoneOnPlateCount = cells.filter((c) => c.type === 'stone_on_plate').length;
  return stoneOnPlateCount === plateCount;
}

/**
 * Executes a push move in Megalith puzzle
 */
export function moveMegalithStone(
  cells: MegalithCell[],
  cols: number,
  rows: number,
  stoneX: number,
  stoneY: number,
  dx: number,
  dy: number
): { success: boolean; newCells: MegalithCell[] } {
  const targetX = stoneX + dx;
  const targetY = stoneY + dy;

  // Check bounds
  if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) {
    return { success: false, newCells: cells };
  }

  const targetCell = cells.find((c) => c.x === targetX && c.y === targetY);
  const currentCell = cells.find((c) => c.x === stoneX && c.y === stoneY);

  if (!currentCell || (currentCell.type !== 'stone' && currentCell.type !== 'stone_on_plate')) {
    return { success: false, newCells: cells };
  }

  // Can only move onto floor or plate
  if (!targetCell || (targetCell.type !== 'floor' && targetCell.type !== 'plate')) {
    return { success: false, newCells: cells };
  }

  const newCells = cells.map((cell) => {
    if (cell.x === stoneX && cell.y === stoneY) {
      return {
        ...cell,
        type: (cell.type === 'stone_on_plate' ? 'plate' : 'floor') as MegalithCell['type'],
      };
    }
    if (cell.x === targetX && cell.y === targetY) {
      return {
        ...cell,
        type: (cell.type === 'plate' ? 'stone_on_plate' : 'stone') as MegalithCell['type'],
      };
    }
    return { ...cell };
  });

  return { success: true, newCells };
}

/**
 * Calculates total exploration and relic mastery score
 */
export function calculateMasteryScore(
  puzzlesSolvedCount: number,
  relicsFoundCount: number,
  stepsTaken: number,
  rewardedBonus: number
): number {
  const puzzlePoints = puzzlesSolvedCount * 500;
  const relicPoints = relicsFoundCount * 750;
  const stepBonus = Math.min(1000, Math.floor(stepsTaken * 0.2));
  return puzzlePoints + relicPoints + stepBonus + (rewardedBonus || 0);
}

/**
 * Calculates level from player experience points
 */
export function calculateLevelFromScore(score: number): { level: number; progressPct: number } {
  const base = 1000;
  const level = Math.max(1, Math.floor(score / base) + 1);
  const currentLevelMin = (level - 1) * base;
  const nextLevelMin = level * base;
  const progressPct = Math.min(100, Math.max(0, Math.round(((score - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100)));
  return { level, progressPct };
}
