import { createBoard, isSolved, rotateTile, tracePowered, NORTH, EAST, SOUTH, WEST } from "./board.js";
import { RelayAudio } from "./audio.js";
import { parseWebUrl } from "./navigation.js";

const STORAGE_KEY = "orbital-relay-save-v1";
const ICON_PORTS = [
  [NORTH, "north"],
  [EAST, "east"],
  [SOUTH, "south"],
  [WEST, "west"]
];

const elements = {
  board: document.querySelector("#relay-board"),
  score: document.querySelector("#score-value"),
  moves: document.querySelector("#moves-value"),
  best: document.querySelector("#best-value"),
  level: document.querySelector("#level-value"),
  sector: document.querySelector("#sector-number"),
  status: document.querySelector("#mission-status"),
  coreStatus: document.querySelector("#core-status"),
  newRun: document.querySelector("#new-run-button"),
  result: document.querySelector("#result-panel"),
  resultLevels: document.querySelector("#result-levels"),
  resultScore: document.querySelector("#result-score"),
  restart: document.querySelector("#restart-button"),
  sound: document.querySelector("#sound-toggle"),
  originCard: document.querySelector("#origin-card"),
  originHost: document.querySelector("#origin-host"),
  retry: document.querySelector("#retry-button"),
  network: document.querySelector("#network-state")
};

const audio = new RelayAudio();
let game = null;
let transitionTimer = null;
let lastPoweredCount = 0;

function readSave() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { best: Number.isFinite(value?.best) ? Math.max(0, value.best) : 0 };
  } catch {
    return { best: 0 };
  }
}

function writeSave() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ best: game.best }));
}

function formatScore(value) {
  return Math.max(0, value).toString().padStart(6, "0");
}

function tileName(tile) {
  if (tile.role === "source") return "Solar input, fixed";
  if (tile.role === "sink") return "Station core, fixed";
  if (!tile.solutionMask) return "Empty station panel";
  if (tile.role === "module") return "Station module relay";
  return "Rotatable power relay";
}

function createPort(className) {
  const port = document.createElement("i");
  port.className = `port ${className}`;
  port.setAttribute("aria-hidden", "true");
  return port;
}

function createTileButton(tile) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `relay-tile role-${tile.role}`;
  button.dataset.index = String(tile.index);
  button.setAttribute("role", "gridcell");
  button.setAttribute("aria-label", tileName(tile));
  if (tile.fixed || !tile.solutionMask) button.disabled = true;

  for (const [bit, className] of ICON_PORTS) {
    if (tile.mask & bit) button.append(createPort(className));
  }

  const node = document.createElement("i");
  node.className = "relay-node";
  node.setAttribute("aria-hidden", "true");
  button.append(node);
  return button;
}

function renderBoard(preserveFocus = null) {
  const powered = tracePowered(game.board);
  elements.board.style.setProperty("--grid-size", game.board.size);
  elements.board.replaceChildren();

  for (const tile of game.board.tiles) {
    const button = createTileButton(tile);
    if (powered.has(tile.index)) button.classList.add("powered");
    elements.board.append(button);
  }

  if (preserveFocus !== null) {
    elements.board.querySelector(`[data-index="${preserveFocus}"]`)?.focus({ preventScroll: true });
  }

  if (powered.size > lastPoweredCount && game.status === "playing") audio.connected();
  lastPoweredCount = powered.size;
}

function renderHud() {
  elements.score.textContent = formatScore(game.score);
  elements.best.textContent = formatScore(game.best);
  elements.moves.textContent = String(game.moves).padStart(2, "0");
  elements.level.textContent = String(game.level).padStart(2, "0");
  elements.sector.textContent = String(game.level).padStart(2, "0");
  elements.moves.classList.toggle("critical", game.moves <= 3);
}

function setCoreOnline(online) {
  elements.coreStatus.classList.toggle("online", online);
  const indicator = document.createElement("span");
  indicator.setAttribute("aria-hidden", "true");
  elements.coreStatus.replaceChildren(indicator, ` CORE ${online ? "ONLINE" : "OFFLINE"}`);
}

function startBoard() {
  game.board = createBoard(game.level);
  game.moves = game.board.moveBudget;
  game.status = "playing";
  lastPoweredCount = 0;
  setCoreOnline(false);
  elements.result.hidden = true;
  elements.status.textContent = `Sector ${game.level}: route power through every active module.`;
  renderHud();
  renderBoard();
}

function newRun() {
  clearTimeout(transitionTimer);
  const save = readSave();
  game = {
    level: 1,
    score: 0,
    best: save.best,
    moves: 0,
    status: "playing",
    board: null
  };
  startBoard();
}

function finishRun() {
  game.status = "failed";
  game.best = Math.max(game.best, game.score);
  writeSave();
  audio.failure();
  renderHud();
  elements.resultLevels.textContent = `${game.level - 1} ${game.level - 1 === 1 ? "sector" : "sectors"}`;
  elements.resultScore.textContent = game.score.toLocaleString();
  elements.result.hidden = false;
  elements.status.textContent = "Repair budget depleted. Start a new mission to try again.";
  elements.restart.focus();
}

function completeBoard() {
  game.status = "transition";
  const bonus = game.level * 250 + game.moves * 25;
  game.score += bonus;
  game.best = Math.max(game.best, game.score);
  writeSave();
  setCoreOnline(true);
  audio.success();
  renderHud();
  elements.status.textContent = `Core restored! +${bonus} points. Preparing the next sector…`;

  transitionTimer = setTimeout(() => {
    game.level += 1;
    startBoard();
  }, 900);
}

function handleRotation(index, direction) {
  if (game.status !== "playing") return;
  if (!rotateTile(game.board, index, direction)) return;
  game.moves -= 1;
  audio.rotate();
  renderHud();
  renderBoard(index);

  if (isSolved(game.board)) {
    completeBoard();
  } else if (game.moves <= 0) {
    finishRun();
  } else {
    elements.status.textContent = `${game.moves} rotations remain in this sector.`;
  }
}

function moveFocus(currentIndex, key) {
  const size = game.board.size;
  let row = Math.floor(currentIndex / size);
  let col = currentIndex % size;
  const delta = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1]
  }[key];

  while (delta) {
    row += delta[0];
    col += delta[1];
    if (row < 0 || row >= size || col < 0 || col >= size) return;
    const candidate = elements.board.querySelector(`[data-index="${row * size + col}"]`);
    if (candidate && !candidate.disabled) {
      candidate.focus();
      return;
    }
  }
}

elements.board.addEventListener("click", (event) => {
  const tile = event.target.closest(".relay-tile");
  if (!tile) return;
  handleRotation(Number(tile.dataset.index), event.shiftKey ? -1 : 1);
});

elements.board.addEventListener("contextmenu", (event) => {
  const tile = event.target.closest(".relay-tile");
  if (!tile || tile.disabled) return;
  event.preventDefault();
  handleRotation(Number(tile.dataset.index), -1);
});

elements.board.addEventListener("keydown", (event) => {
  const tile = event.target.closest(".relay-tile");
  if (!tile) return;
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    moveFocus(Number(tile.dataset.index), event.key);
  }
});

elements.newRun.addEventListener("click", newRun);
elements.restart.addEventListener("click", newRun);
elements.sound.addEventListener("click", () => {
  const muted = audio.toggle();
  elements.sound.setAttribute("aria-pressed", String(muted));
  elements.sound.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  elements.sound.classList.toggle("muted", muted);
  if (!muted) audio.connected();
});

function getOriginalUrl() {
  const value = new URLSearchParams(location.search).get("from");
  return value ? parseWebUrl(value) : null;
}

function updateNetworkState() {
  const online = navigator.onLine;
  elements.network.classList.toggle("offline", !online);
  elements.network.lastChild.textContent = online ? " Local system ready" : " Network unavailable";
}

const originalUrl = getOriginalUrl();
if (originalUrl) {
  elements.originCard.hidden = false;
  elements.originHost.textContent = originalUrl.hostname;
  elements.retry.addEventListener("click", () => location.assign(originalUrl.href));
}

elements.sound.setAttribute("aria-pressed", String(audio.muted));
elements.sound.setAttribute("aria-label", audio.muted ? "Enable sound" : "Mute sound");
elements.sound.classList.toggle("muted", audio.muted);
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
updateNetworkState();
newRun();

if (location.protocol === "http:" || location.protocol === "https:") {
  navigator.serviceWorker?.register("./web-sw.js").catch(() => {});
}
