// 1200x630 social preview per episode, composed with sharp at build time.
// Text is SVG rendered through fontconfig; assets/og/fonts holds the TTFs and the
// build script points FONTCONFIG_PATH there.
import { resolve } from 'node:path';
import sharp from 'sharp';

const W = 1200;
const H = 630;
const PAPER = '#f7f6f1';
const INK = '#434342';
const SOFT = '#6b6b69';
const GOLD = '#f5b719';
const DEEP = '#8a5a00';
const NIGHT = '#252f3e';
const NIGHT_INK = '#f0eee5';
const BADGE = resolve('assets/og/badge.png'); // cwd-relative, like FONTCONFIG_PATH

export interface OgInput {
  title: string;
  tool: string;
  episode: number;
  card: 'paper' | 'night';
  thumb?: string | null; // only the night card uses it, as a blurred backdrop
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ponytail: greedy wrap on a character budget; Radio Canada Big Bold averages ~0.53em
// per glyph, which holds for the titles we have. Measure with opentype.js if it stops.
function wrap(text: string, max: number) {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

const eyebrow = (x: number, y: number, t: string, fill: string) =>
  `<text x="${x}" y="${y}" font-family="Geist Mono" font-size="20" letter-spacing="3" fill="${fill}">${esc(t.toUpperCase())}</text>`;
const headline = (x: number, y: number, lines: string[], size: number, fill: string) =>
  lines
    .map((l, i) => `<text x="${x}" y="${y + i * size * 1.08}" font-family="Radio Canada Big" font-weight="700" font-size="${size}" fill="${fill}">${esc(l)}</text>`)
    .join('');
const wordmark = (x: number, y: number, fill: string, flag: string) =>
  `<text x="${x}" y="${y}" font-family="Radio Canada Big" font-weight="700" font-size="26" fill="${fill}">Observability <tspan fill="${flag}">on Board</tspan></text>`;
const svg = (body: string) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);

export async function renderOg(e: OgInput): Promise<Buffer> {
  const label = `Episode ${e.episode} · ${e.tool}`;
  if (e.card === 'night' && e.thumb) {
    const frame = Buffer.from(await (await fetch(e.thumb)).arrayBuffer());
    const bg = await sharp(frame).resize(W, H, { fit: 'cover' }).blur(30).modulate({ brightness: 0.5, saturation: 0.7 }).png().toBuffer();
    const lines = wrap(e.title, 26);
    const size = lines.length > 2 ? 58 : 68;
    const body = `<rect width="${W}" height="${H}" fill="${NIGHT}" fill-opacity="0.72"/>
      ${eyebrow(80, 120, label, GOLD)}
      ${headline(80, 210, lines, size, '#ffffff')}
      ${wordmark(80, 560, NIGHT_INK, GOLD)}`;
    const badge = await sharp(BADGE).resize(190).png().toBuffer();
    return sharp(bg).composite([{ input: svg(body) }, { input: badge, left: 950, top: 390 }]).png().toBuffer();
  }
  const lines = wrap(e.title, 22);
  const size = lines.length > 2 ? 56 : 64;
  const body = `<rect width="${W}" height="${H}" fill="${PAPER}"/>
    <rect x="450" y="120" width="72" height="8" fill="${GOLD}"/>
    ${eyebrow(450, 160, label, SOFT)}
    ${headline(450, 240, lines, size, INK)}
    ${wordmark(450, 505, INK, DEEP)}`;
  return sharp(svg(body)).composite([{ input: BADGE, left: 85, top: 170 }]).png().toBuffer();
}
