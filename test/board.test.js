import test from "node:test";
import assert from "node:assert/strict";
import {
  createBoard,
  isSolved,
  minimumTurns,
  rotateMask,
  rotateTile,
  sizeForLevel,
  tracePowered,
  NORTH,
  EAST,
  SOUTH,
  WEST
} from "../src/board.js";

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

test("connector masks rotate clockwise and wrap", () => {
  assert.equal(rotateMask(NORTH), EAST);
  assert.equal(rotateMask(EAST), SOUTH);
  assert.equal(rotateMask(SOUTH), WEST);
  assert.equal(rotateMask(WEST), NORTH);
  assert.equal(rotateMask(NORTH | SOUTH, 2), NORTH | SOUTH);
  assert.equal(rotateMask(NORTH, -1), WEST);
});

test("board size increases every three sectors and caps at seven", () => {
  assert.deepEqual([1, 3, 4, 6, 7, 9, 10, 30].map(sizeForLevel), [4, 4, 5, 5, 6, 6, 7, 7]);
});

test("generated boards are scrambled, connected in their solution, and fairly budgeted", () => {
  for (let seed = 1; seed <= 120; seed += 1) {
    const level = (seed % 14) + 1;
    const board = createBoard(level, seededRandom(seed));
    const solutionPower = tracePowered(board, true);
    const activeTiles = board.tiles.filter((tile) => tile.solutionMask !== 0);

    assert.equal(isSolved(board), false, `seed ${seed} should start scrambled`);
    assert.equal(solutionPower.size, activeTiles.length, `seed ${seed} solution should power every active tile`);
    assert.ok(board.optimalMoves > 0);
    assert.ok(board.moveBudget >= board.optimalMoves + 4);
    assert.equal(board.size, sizeForLevel(level));
  }
});

test("every generated board can be solved within its move budget", () => {
  for (let seed = 200; seed < 240; seed += 1) {
    const board = createBoard((seed % 12) + 1, seededRandom(seed));
    let moves = 0;

    for (const tile of board.tiles) {
      if (tile.fixed || tile.solutionMask === 0) continue;
      const clockwise = [0, 1, 2, 3].find((turns) => rotateMask(tile.mask, turns) === tile.solutionMask);
      const direction = clockwise === 3 ? -1 : 1;
      const turns = minimumTurns(tile.mask, tile.solutionMask);
      for (let step = 0; step < turns; step += 1) {
        assert.equal(rotateTile(board, tile.index, direction), true);
        moves += 1;
      }
    }

    assert.equal(isSolved(board), true, `seed ${seed} should be solvable`);
    assert.equal(moves, board.optimalMoves);
    assert.ok(moves <= board.moveBudget);
  }
});

test("fixed and empty tiles cannot rotate", () => {
  const board = createBoard(1, seededRandom(999));
  assert.equal(rotateTile(board, board.sourceIndex), false);
  const empty = board.tiles.find((tile) => tile.solutionMask === 0);
  assert.equal(rotateTile(board, empty.index), false);
});

