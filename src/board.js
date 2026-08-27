export const NORTH = 1;
export const EAST = 2;
export const SOUTH = 4;
export const WEST = 8;

const DIRECTIONS = [
  { bit: NORTH, opposite: SOUTH, row: -1, col: 0 },
  { bit: EAST, opposite: WEST, row: 0, col: 1 },
  { bit: SOUTH, opposite: NORTH, row: 1, col: 0 },
  { bit: WEST, opposite: EAST, row: 0, col: -1 }
];

export function rotateMask(mask, turns = 1) {
  let result = mask;
  const normalized = ((turns % 4) + 4) % 4;
  for (let index = 0; index < normalized; index += 1) {
    result = ((result << 1) & 15) | ((result & WEST) ? NORTH : 0);
  }
  return result;
}

export function sizeForLevel(level) {
  return Math.min(7, 4 + Math.floor((Math.max(1, level) - 1) / 3));
}

function indexFor(size, row, col) {
  return row * size + col;
}

function connect(tiles, size, fromRow, fromCol, toRow, toCol) {
  const from = tiles[indexFor(size, fromRow, fromCol)];
  const to = tiles[indexFor(size, toRow, toCol)];

  if (toRow < fromRow) {
    from.solutionMask |= NORTH;
    to.solutionMask |= SOUTH;
  } else if (toRow > fromRow) {
    from.solutionMask |= SOUTH;
    to.solutionMask |= NORTH;
  } else if (toCol > fromCol) {
    from.solutionMask |= EAST;
    to.solutionMask |= WEST;
  } else {
    from.solutionMask |= WEST;
    to.solutionMask |= EAST;
  }
}

function shuffle(values, rng) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  return values;
}

function createSolvedTiles(size, rng) {
  const tiles = Array.from({ length: size * size }, (_, index) => ({
    index,
    solutionMask: 0,
    mask: 0,
    fixed: false,
    role: "relay"
  }));

  const rows = [Math.floor(rng() * size)];
  for (let col = 1; col < size; col += 1) {
    const previous = rows[col - 1];
    const choices = [previous];
    if (previous > 0) choices.push(previous - 1);
    if (previous < size - 1) choices.push(previous + 1);
    rows.push(choices[Math.floor(rng() * choices.length)]);
  }

  let currentRow = rows[0];
  const pathIndexes = [indexFor(size, currentRow, 0)];

  for (let col = 0; col < size - 1; col += 1) {
    const nextRow = rows[col + 1];
    if (nextRow !== currentRow) {
      connect(tiles, size, currentRow, col, nextRow, col);
      currentRow = nextRow;
      pathIndexes.push(indexFor(size, currentRow, col));
    }
    connect(tiles, size, currentRow, col, currentRow, col + 1);
    pathIndexes.push(indexFor(size, currentRow, col + 1));
  }

  const sourceIndex = indexFor(size, rows[0], 0);
  const sinkIndex = indexFor(size, currentRow, size - 1);
  tiles[sourceIndex].solutionMask |= WEST;
  tiles[sourceIndex].fixed = true;
  tiles[sourceIndex].role = "source";
  tiles[sinkIndex].solutionMask |= EAST;
  tiles[sinkIndex].fixed = true;
  tiles[sinkIndex].role = "sink";

  const branchCandidates = shuffle([...new Set(pathIndexes)], rng);
  const branchTarget = Math.max(2, Math.floor(size / 2));
  let branches = 0;

  for (const pathIndex of branchCandidates) {
    if (branches >= branchTarget) break;
    const row = Math.floor(pathIndex / size);
    const col = pathIndex % size;
    const neighbors = shuffle([...DIRECTIONS], rng);

    for (const direction of neighbors) {
      const nextRow = row + direction.row;
      const nextCol = col + direction.col;
      if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) continue;

      const nextIndex = indexFor(size, nextRow, nextCol);
      if (tiles[nextIndex].solutionMask !== 0) continue;

      connect(tiles, size, row, col, nextRow, nextCol);
      tiles[nextIndex].role = "module";
      branches += 1;
      break;
    }
  }

  return { tiles, sourceIndex, sinkIndex };
}

export function tracePowered(board, useSolution = false) {
  const { size, tiles, sourceIndex } = board;
  const powered = new Set([sourceIndex]);
  const queue = [sourceIndex];

  while (queue.length) {
    const index = queue.shift();
    const row = Math.floor(index / size);
    const col = index % size;
    const mask = useSolution ? tiles[index].solutionMask : tiles[index].mask;

    for (const direction of DIRECTIONS) {
      if (!(mask & direction.bit)) continue;
      const nextRow = row + direction.row;
      const nextCol = col + direction.col;
      if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) continue;

      const nextIndex = indexFor(size, nextRow, nextCol);
      const nextMask = useSolution ? tiles[nextIndex].solutionMask : tiles[nextIndex].mask;
      if (!(nextMask & direction.opposite) || powered.has(nextIndex)) continue;
      powered.add(nextIndex);
      queue.push(nextIndex);
    }
  }

  return powered;
}

export function isSolved(board) {
  const powered = tracePowered(board);
  if (!powered.has(board.sinkIndex)) return false;
  return board.tiles.every((tile) => tile.solutionMask === 0 || powered.has(tile.index));
}

export function minimumTurns(fromMask, targetMask) {
  for (let turns = 0; turns < 4; turns += 1) {
    if (rotateMask(fromMask, turns) === targetMask) {
      return Math.min(turns, 4 - turns);
    }
  }
  return 0;
}

export function createBoard(level = 1, rng = Math.random) {
  const size = sizeForLevel(level);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const solved = createSolvedTiles(size, rng);
    let rotatableCount = 0;
    let optimalMoves = 0;

    for (const tile of solved.tiles) {
      if (!tile.solutionMask || tile.fixed) {
        tile.mask = tile.solutionMask;
        continue;
      }

      rotatableCount += 1;
      const turns = Math.floor(rng() * 4);
      tile.mask = rotateMask(tile.solutionMask, turns);
      optimalMoves += minimumTurns(tile.mask, tile.solutionMask);
    }

    const board = {
      level,
      size,
      tiles: solved.tiles,
      sourceIndex: solved.sourceIndex,
      sinkIndex: solved.sinkIndex,
      optimalMoves,
      moveBudget: optimalMoves + Math.max(4, Math.ceil(rotatableCount * 0.35))
    };

    if (optimalMoves > 0 && !isSolved(board)) return board;
  }

  throw new Error("Unable to generate a scrambled relay board");
}

export function rotateTile(board, index, direction = 1) {
  const tile = board.tiles[index];
  if (!tile || tile.fixed || tile.solutionMask === 0) return false;
  tile.mask = rotateMask(tile.mask, direction);
  return true;
}

