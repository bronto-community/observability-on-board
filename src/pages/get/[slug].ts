import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

const SITE = 'https://observability-on-board.vercel.app';
const SHIPS = ['bronto', 'collector', 'custom'] as const;
const SHIP_TITLE: Record<string, string> = {
  bronto: 'Bronto',
  collector: 'Local Collector',
  custom: 'Your endpoint',
};

interface Section {
  target: string;
  dummyAuth: boolean;
  lines: string[];
}

// Pull the top-level <div class="ship ship-X"> ... </div> sections out of the
// episode markdown, tracking div depth for nesting.
function extractSections(body: string) {
  const lines = body.split('\n');
  const ships: Section[] = [];
  let current: Section | null = null;
  let depth = 0;

  for (const line of lines) {
    const open = line.match(/<div class="ship ship-(\w+)"([^>]*)>/);
    if (!current && open) {
      current = { target: open[1], dummyAuth: line.includes('data-empty-auth="dummy"'), lines: [] };
      depth = 1;
      continue;
    }
    if (current) {
      depth += (line.match(/<div/g) ?? []).length;
      depth -= (line.match(/<\/div>/g) ?? []).length;
      if (depth <= 0) {
        ships.push(current);
        current = null;
        continue;
      }
      current.lines.push(line);
    }
  }
  return ships;
}

// Inside a ship section, keep either the knob-basic or the knob-full variant
// and drop the tab bar. Content outside knob divs always stays.
function filterKnobs(lines: string[], full: boolean): string[] {
  const out: string[] = [];
  let mode: 'tabs' | 'basic' | 'full' | null = null;
  let depth = 0;
  for (const line of lines) {
    if (!mode) {
      const m = line.match(/<div class="knob-(tabs|basic|full)"/);
      if (m) {
        mode = m[1] as typeof mode;
        depth = 1;
        continue;
      }
      out.push(line);
      continue;
    }
    depth += (line.match(/<div/g) ?? []).length;
    depth -= (line.match(/<\/div>/g) ?? []).length;
    if (depth <= 0) {
      mode = null;
      continue;
    }
    if (mode === 'basic' && !full) out.push(line);
    if (mode === 'full' && full) out.push(line);
  }
  return out;
}

// Markdown-ish lines to terminal text: code blocks verbatim, prose as # comments,
// raw HTML (tabs, wrappers) dropped.
function renderLines(lines: string[]): string {
  const out: string[] = [];
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inCode = !inCode;
      out.push('');
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }
    if (/^\s*<\/?(div|button|span)/.test(line)) continue;
    const prose = line
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => (u.startsWith('/') ? `${t} (${SITE}${u})` : `${t} (${u})`))
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\*\*([^*]*)\*\*/g, '$1');
    out.push(prose.trim() ? `# ${prose.trim()}` : '');
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async ({ params, url }) => {
  const respond = (text: string, status = 200) =>
    new Response(text + '\n', {
      status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      },
    });

  const episodes = await getCollection('episodes');
  const entry = episodes.find((e) => e.id === params.slug);
  if (!entry || !entry.body) {
    const slugs = episodes.map((e) => `#   ${SITE}/get/${e.id}`).join('\n');
    return respond(`# unknown episode "${params.slug}" — available:\n${slugs}`, 404);
  }

  const q = url.searchParams;
  const notes: string[] = [];
  let ship = q.get('ship');
  if (ship && !SHIPS.includes(ship as (typeof SHIPS)[number])) {
    notes.push(`# unknown ship "${ship}" — showing all targets (bronto, collector, custom)`);
    ship = null;
  }
  const region = q.get('region') === 'us' ? 'us' : 'eu';
  const dataset = q.get('dataset');
  const endpoint = q.get('endpoint');
  const header = q.get('header');
  const value = q.get('value');
  const full = q.get('full') === '1';

  const ships = extractSections(entry.body);
  const hasKnobs = entry.body.includes('knob-full');

  const sections: string[] = [];
  for (const s of ships) {
    if (ship && s.target !== ship) continue;
    let text = renderLines(filterKnobs(s.lines, full));
    if (s.target === 'bronto') {
      if (region === 'us') text = text.replaceAll('ingestion.eu.bronto.io', 'ingestion.us.bronto.io');
      if (dataset) {
        text = text
          .replace(/x-bronto-dataset=[^,"'\s]+/g, () => `x-bronto-dataset=${dataset}`)
          .replace(/telemetry-service-name=.+/g, () => `telemetry-service-name=${dataset}`)
          .replace(/OTEL_SERVICE_NAME=[^,"'\s]+/g, () => `OTEL_SERVICE_NAME=${dataset}`);
      }
    }
    if (s.target === 'custom') {
      if (endpoint) {
        text = text.replaceAll('YOUR_OTLP_ENDPOINT', () => endpoint.replace(/\/+$/, ''));
        if (header && value) {
          text = text.replaceAll('YOUR_AUTH_HEADER', () => header).replaceAll('YOUR_AUTH_VALUE', () => value);
          notes.push('# careful: passing ?value= puts a secret into URLs and request logs.');
          notes.push('# leave it off to keep YOUR_AUTH_VALUE as the one thing you paste locally.');
        } else if (s.dummyAuth) {
          text = text.replaceAll('YOUR_AUTH_HEADER', 'x-otel-auth').replaceAll('YOUR_AUTH_VALUE', 'none');
        } else {
          text = text
            .split('\n')
            .filter((l) => !l.includes('YOUR_AUTH_HEADER'))
            .join('\n');
        }
      }
    }
    sections.push(`# ── ${SHIP_TITLE[s.target]} ${'─'.repeat(Math.max(2, 40 - s.target.length))}\n\n${text}`);
  }

  const videoId = entry.data.video?.split('/').pop();
  const head = [
    `# ${entry.data.title}`,
    `# Observability on Board — episode ${String(entry.data.episode).padStart(2, '0')}`,
    `# docs:  ${entry.data.docs}`,
    `# page:  ${SITE}/episodes/${entry.id}/`,
    ...(videoId ? [`# video: https://youtube.com/shorts/${videoId}`] : []),
    '#',
    '# variants: ?ship=bronto|collector|custom  &region=us  &dataset=<name>',
    `#           ?endpoint=<url>&header=<name>&value=<secret>   (custom target)${hasKnobs ? '  &full=1' : ''}`,
    ...notes,
  ].join('\n');

  return respond(`${head}\n\n${sections.join('\n\n')}`);
};
