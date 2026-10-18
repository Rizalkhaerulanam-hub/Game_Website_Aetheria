import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBeamPath,
  checkMegalithSolved,
  moveMegalithStone,
  calculateMasteryScore,
  calculateLevelFromScore
} from '../puzzleLogic.ts';
import {
  encryptSaveData,
  decryptSaveData,
  generateChecksum
} from '../encryption.ts';
import type { MirrorCell, MegalithCell } from '../types.ts';

test('Beam path calculation reflects correctly through "/" mirror', () => {
  const cells: MirrorCell[] = [
    { x: 0, y: 1, type: 'emitter', direction: 'east' },
    { x: 2, y: 1, type: 'mirror', mirrorAngle: '/' }, // east -> north
    { x: 2, y: 0, type: 'receiver', direction: 'south' }
  ];

  const result = calculateBeamPath(3, 3, cells);
  assert.equal(result.receiverActivated, true);
  assert.equal(result.hitCells.has('2,0'), true);
});

test('Beam stops when hitting a wall', () => {
  const cells: MirrorCell[] = [
    { x: 0, y: 0, type: 'emitter', direction: 'east' },
    { x: 1, y: 0, type: 'wall' },
    { x: 2, y: 0, type: 'receiver' }
  ];

  const result = calculateBeamPath(3, 3, cells);
  assert.equal(result.receiverActivated, false);
  assert.equal(result.hitCells.has('2,0'), false);
});

test('Megalith puzzle checks win condition correctly', () => {
  const unsolvedCells: MegalithCell[] = [
    { x: 0, y: 0, type: 'plate' },
    { x: 1, y: 0, type: 'stone' }
  ];
  assert.equal(checkMegalithSolved(unsolvedCells), false);

  const solvedCells: MegalithCell[] = [
    { x: 0, y: 0, type: 'stone_on_plate' }
  ];
  assert.equal(checkMegalithSolved(solvedCells), true);
});

test('Megalith stone moves onto plate and updates cell type', () => {
  const cells: MegalithCell[] = [
    { x: 0, y: 0, type: 'stone' },
    { x: 1, y: 0, type: 'plate' }
  ];

  const moveRes = moveMegalithStone(cells, 2, 1, 0, 0, 1, 0);
  assert.equal(moveRes.success, true);
  assert.equal(checkMegalithSolved(moveRes.newCells), true);
});

test('Mastery scoring and level progression math is deterministic', () => {
  const score = calculateMasteryScore(2, 1, 500, 200);
  // 2 * 500 = 1000 + 750 + 100 + 200 = 2050
  assert.equal(score, 2050);

  const { level, progressPct } = calculateLevelFromScore(2050);
  assert.equal(level, 3);
  assert.equal(progressPct, 5); // 2050 - 2000 = 50 / 1000 = 5%
});

test('Encryption and decryption roundtrip preserves data integrity', () => {
  const sampleData = {
    playerId: 'hero_123',
    score: 9500,
    currentBiome: 'crystal'
  };

  const encrypted = encryptSaveData(sampleData);
  assert.ok(typeof encrypted === 'string' && encrypted.length > 20);

  const decrypted = decryptSaveData<typeof sampleData>(encrypted);
  assert.equal(decrypted.success, true);
  assert.deepEqual(decrypted.data, sampleData);
});

test('Decryption rejects tampered data', () => {
  const tamperedEnvelope = Buffer.from(
    JSON.stringify({
      sig: 'fake_hash',
      v: 2,
      ts: Date.now(),
      d: JSON.stringify({ score: 999999 })
    })
  ).toString('base64');

  const result = decryptSaveData(tamperedEnvelope);
  assert.equal(result.success, false);
  assert.match(result.error || '', /tamper/i);
});
