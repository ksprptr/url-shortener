// Renders the committed app icons from `src/configs/logo.config.ts`; re-run after a mark change.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Mirrors src/configs/logo.config.ts (and app.config.ts for the name); the assertion below fails
// the script if any of them drift. This is a plain .mjs, so it cannot import the TS configs.
const ICON_RATIO = 0.56;
const APP_NAME = 'URL Shortener';
const logo = {
  size: 512,
  radius: 112,
  background: '#0891b2',
  foreground: '#ffffff',
  icon: {
    grid: 24,
    strokeWidth: 2.25,
    nodes: [
      { tag: 'path', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
      { tag: 'path', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
    ],
  },
};

const round = (value) => Math.round(value * 1e4) / 1e4;
const scale = round((logo.size * ICON_RATIO) / logo.icon.grid);
const offset = round((logo.size * (1 - ICON_RATIO)) / 2);

/**
 * Serializes a single logo stroke as SVG markup.
 **/
const renderNode = (node) =>
  node.tag === 'path'
    ? `<path d="${node.d}" />`
    : `<line x1="${node.x1}" y1="${node.y1}" x2="${node.x2}" y2="${node.y2}" />`;

/**
 * Builds the logo SVG; `radius` is overridable so the Apple icon can be a full-bleed square.
 **/
const buildSvg = ({ radius = logo.radius, title = APP_NAME } = {}) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${logo.size}" height="${logo.size}" viewBox="0 0 ${logo.size} ${logo.size}" fill="none">`,
    `  <title>${title}</title>`,
    `  <rect width="${logo.size}" height="${logo.size}" rx="${radius}" fill="${logo.background}" />`,
    `  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${logo.foreground}" stroke-width="${logo.icon.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`,
    ...logo.icon.nodes.map((node) => `    ${renderNode(node)}`),
    `  </g>`,
    `</svg>`,
    '',
  ].join('\n');

/**
 * Rasterizes the mark at one edge length.
 **/
const png = (size, svg) =>
  sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Packs PNG buffers into an ICO container (PNG-compressed entries, supported everywhere modern).
 **/
const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offsetBytes = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    // 0 means 256 in the ICO directory; none of our sizes hit that, but keep the rule explicit.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offsetBytes, 12);
    offsetBytes += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
};

/**
 * Fails loudly if the script's copy of the geometry no longer matches the app's config.
 **/
const assertInSyncWithConfig = async () => {
  const { readFile } = await import('node:fs/promises');
  const config = await readFile(path.join(webRoot, 'src/configs/logo.config.ts'), 'utf8');
  const appConfig = await readFile(path.join(webRoot, 'src/configs/app/app.config.ts'), 'utf8');

  if (!appConfig.includes(`name: '${APP_NAME}'`)) {
    throw new Error(
      `generate-icons.mjs has drifted from app.config.ts — it still uses APP_NAME '${APP_NAME}'.`,
    );
  }

  const expected = [
    `size: ${logo.size}`,
    `radius: ${logo.radius}`,
    `background: '${logo.background}'`,
    `foreground: '${logo.foreground}'`,
    `const ICON_RATIO = ${ICON_RATIO}`,
    `strokeWidth: ${logo.icon.strokeWidth}`,
    ...logo.icon.nodes.map((node) => node.d),
  ];

  const missing = expected.filter((needle) => !config.includes(needle));
  if (missing.length > 0) {
    throw new Error(
      `generate-icons.mjs has drifted from logo.config.ts — not found there: ${missing.join(', ')}`,
    );
  }
};

async function main() {
  await assertInSyncWithConfig();

  const svg = buildSvg();
  // Full-bleed for anything the platform masks itself: a rounded source leaves transparent gaps.
  const maskableSvg = buildSvg({ radius: 0 });

  const write = async (relative, data) => {
    const target = path.join(webRoot, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    console.log(`  ${relative} (${data.length.toLocaleString('en-GB')} B)`);
  };

  await write('src/app/icon0.svg', svg);
  await write('public/logo.svg', svg);

  await write('src/app/icon1.png', await png(96, svg));
  await write('src/app/apple-icon.png', await png(180, maskableSvg));
  await write('public/web-app-manifest-192x192.png', await png(192, maskableSvg));
  await write('public/web-app-manifest-512x512.png', await png(512, maskableSvg));

  const icoSizes = [16, 32, 48];
  const icoImages = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await png(size, svg) })),
  );
  await write('src/app/favicon.ico', buildIco(icoImages));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
