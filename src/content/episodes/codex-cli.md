---
title: 'Codex CLI already reports what every turn sends'
tool: 'OpenAI Codex CLI'
episode: 7
description: 'Codex CLI ships an OpenTelemetry exporter and leaves it off. One [otel] block in ~/.codex/config.toml turns on a record per event, with token counts.'
takeaway: 'The same job asked two ways: 104.2k tokens one time, 87.1k the other, and the difference is naming the file.'
signals: ['logs']
docs: 'https://learn.chatgpt.com/docs/config-file/config-advanced'
video: 'https://www.youtube-nocookie.com/embed/k-e-76zvkW4'
verified: '2026-09-18'
---

## Switch it on

Add an `[otel]` block to `~/.codex/config.toml`. Codex ships the exporter and leaves it
switched off; every turn then arrives as logs, one record per event, with the token counts on
each completed response. The endpoint is used exactly as written, so name the logs path
yourself. Verified on Codex CLI 0.154.0.

<div class="ship ship-bronto">

```toml
[otel]
environment = "production"
log_user_prompt = false

[otel.exporter.otlp-http]
endpoint = "https://ingestion.eu.bronto.io/v1/logs"
protocol = "binary"

[otel.exporter.otlp-http.headers]
x-bronto-api-key = "<BRONTO_API_KEY>"
```

Codex does not expand `$VAR` in a header value, so the key goes in literally.

</div>
<div class="ship ship-collector">

```toml
[otel]
environment = "production"
log_user_prompt = false

[otel.exporter.otlp-http]
endpoint = "http://localhost:4318/v1/logs"
protocol = "binary"
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```toml
[otel]
environment = "production"
log_user_prompt = false

[otel.exporter.otlp-http]
endpoint = "YOUR_OTLP_ENDPOINT/v1/logs"
protocol = "binary"

[otel.exporter.otlp-http.headers]
YOUR_AUTH_HEADER = "YOUR_AUTH_VALUE"
```

</div>
