# Observability on Board

The **Observability on Board** video series, in copy-pasteable form: switching on the
OpenTelemetry support tools already ship, using the configuration surfaces they already
have.

**Website: https://observability-on-board.vercel.app**

Built with ❤️ at [Bronto](https://bronto.io).

## The website

An [Astro](https://astro.build) static site. Episodes live as markdown in
`src/content/episodes/`, one file per tool, most with a video, each with the config for three
telemetry targets (Bronto, a local Collector, or any OTLP endpoint the visitor saves),
and the signals it exports.

Frontmatter per episode: `title`, `tool`, `episode`, `description`, `takeaway`,
`signals` (`traces`/`metrics`/`logs`), `docs` (link to the tool's own documentation,
required), plus optional `video` (a 9:16 YouTube embed URL,
`https://www.youtube-nocookie.com/embed/<id>`), `blog` (a write-up, ours or
third-party), `share` (override for the ote.li short link; defaults to ote.li/with/<slug>), `verified` (date the commands last
ran end to end) and `hidden`.

`hidden: true` ships an episode without announcing it. The page and its `/get/<slug>`
text form are built and reachable by URL, but it is left off the landing page, out of the
prev/next chain, out of the sitemap and marked `noindex`. Remove the line to publish.

```bash
npm install
npm run dev      # local dev server
npm run build    # static build to dist/
```

Every episode is also served as plain text for terminal use at `/get/<slug>` — the
one server-rendered route; everything else is static. Variants via query:
`?ship=bronto|collector|custom`, `&region=us`, `&dataset=<name>`,
`&endpoint=<url>&header=<name>&value=<secret>`, `&full=1`.

New episodes start from `src/content/_episode-template.md`; its header comment
lists the conventions the interactive layer depends on. See CONTRIBUTING.md.

Rules for episode pages:

1. Start with the shortest path to success. No warm-up sections; the config comes
   first, under a "Switch it on" heading.
2. Give the maximum from the start: every signal the tool can export goes into the
   one main config block. Experimental features are fine, labelled as such — no
   "by the way, you can also get metrics" sections further down.
3. Persistent over temporary. If a config file survives where a shell export
   doesn't, the file is what we show, even when the video shows the export.
4. Keep it brief. What-you-get inventories, failure catalogues and tuning notes are
   deliberately left out for now, and a note that isn't needed for success gets cut.
   No parenthetical asides. Don't overexplain.

## License

Code is licensed under [Apache-2.0](LICENSE). Written content — episode texts and
instructions — is licensed under [CC BY 4.0](LICENSE-CONTENT).
