import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const output = resolve(here, "..", "assets");
mkdirSync(output, { recursive: true });

const palette = {
  dark: [7, 18, 31, 255],
  panel: [12, 38, 49, 255],
  cyan: [105, 246, 228, 255],
  green: [184, 255, 100, 255],
  shadow: [22, 79, 81, 255]
};

const pattern = [
  "................",
  ".....gggg.......",
  "....gccccg......",
  "...gc....cg.....",
  "..gc..cc..cg....",
  ".gc...cc...cg...",
  ".gc...cc...cg...",
  ".gc.ccggcc.cg...",
  ".gc.ccggcc.cg...",
  ".gc...cc...cg...",
  ".gc...cc...cg...",
  "..gc..cc..cg....",
  "...gc....cg.....",
  "....gccccg......",
  ".....gggg.......",
  "................"
];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function render(size) {
  const scale = size / 16;
  const rows = [];
  for (let y = 0; y < size; y += 1) {
    const row = [0];
    for (let x = 0; x < size; x += 1) {
      const symbol = pattern[Math.floor(y / scale)][Math.floor(x / scale)];
      const color = symbol === "c" ? palette.cyan : symbol === "g" ? palette.green : palette.dark;
      const edge = x < scale || y < scale || x >= size - scale || y >= size - scale;
      row.push(...(symbol === "." && edge ? palette.panel : color));
    }
    rows.push(Buffer.from(row));
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

for (const size of [16, 48, 128]) {
  writeFileSync(resolve(output, `icon-${size}.png`), render(size));
}

