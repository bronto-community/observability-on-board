---
# Copy this file to src/content/episodes/<slug>.md and fill it in.
# (This template lives outside episodes/ so the site never builds it.)
#
# Contracts the site's JavaScript depends on — break one and the page still
# builds, but a reader gets a broken config:
#
# 1. Every episode has exactly three target divs, in this order:
#      <div class="ship ship-bronto"> … <div class="ship ship-collector"> … <div class="ship ship-custom">
#    CI counts them.
# 2. Bronto code blocks write the EU host literally: https://ingestion.eu.bronto.io
#    The EU/US toggle rewrites exactly that string.
# 3. Custom-tab code blocks use these placeholder tokens, verbatim:
#      YOUR_OTLP_ENDPOINT   YOUR_AUTH_HEADER   YOUR_AUTH_VALUE
#    Saved values substitute them; when no auth is saved, the whole line
#    containing YOUR_AUTH_HEADER is DELETED — so in JSON blocks that line must
#    not be the last property (the previous line would keep a dangling comma).
#    If the tool requires a headers line even without auth (BuildKit does),
#    put data-empty-auth="dummy" on the ship-custom div instead: the tokens
#    then become x-otel-auth=none rather than being deleted.
# 4. Setup-guide links point at /setup/#collector and /setup/#custom.
#
# Voice: config first under "## Switch it on"; a lead-in sentence, the block,
# at most one short trailing note per target. No parentheticals, no
# overexplaining, no sections after the config. Signals use the official OTel
# names only. See the rules in README.md.
title: '<Tool> already speaks OpenTelemetry'
tool: '<Tool>'
episode: 0
description: 'One or two sentences; doubles as the page lede and the meta description. Keep under 155 characters.'
takeaway: 'The one-line hook shown on the episode card.'
signals: ['traces', 'metrics', 'logs']
docs: 'https://example.com/the-tools-own-observability-docs'
# blog: 'https://bronto.io/blog/...'                     # optional
# video: 'https://www.youtube-nocookie.com/embed/<id>'   # optional, 9:16 Short
# share: 'https://ote.li/with-<name>'   # optional override; default is ote.li/with/<slug> via the catch-all redirect
verified: '2026-01-01'
# hidden: true    # optional: build the page but keep it off the landing page
---

## Switch it on

One lead-in sentence: where the config goes and what it exports.

<div class="ship ship-bronto">

```ini
telemetry-endpoint=https://ingestion.eu.bronto.io
```

At most one short note.

</div>
<div class="ship ship-collector">

```ini
telemetry-endpoint=http://localhost:4318
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```ini
telemetry-endpoint=YOUR_OTLP_ENDPOINT
telemetry-header-YOUR_AUTH_HEADER=YOUR_AUTH_VALUE
```

</div>
