---
title: 'Codex CLI already reports what every turn costs'
tool: 'OpenAI Codex CLI'
episode: 7
description: 'Codex CLI has an [otel] block in ~/.codex/config.toml. Four lines switch on an OTLP log exporter that reports the token cost of every turn.'
takeaway: 'One prompt, nine model calls: 134.8k tokens sent, 2.1k read back.'
signals: ['logs']
docs: 'https://developers.openai.com/codex/config-reference'
verified: '2026-09-16'
hidden: true
---

## Switch it on

Codex CLI ships its own OpenTelemetry exporter, switched on by an `[otel]` block that
`~/.codex/config.toml` does not have by default. It exports logs, one record per event in a
turn, and the record for a completed response carries `input_token_count`,
`output_token_count`, `cached_token_count` and `reasoning_token_count`. The endpoint string
is used verbatim, with nothing appended, so it has to name the logs path itself.
`service.name` is not configurable: records arrive as `codex_cli_rs` from the interactive
session and `codex_exec` from `codex exec`. Verified on Codex CLI 0.154.0.

<div class="ship ship-bronto">

In `~/.codex/config.toml`:

```toml
[otel]
environment = "production"
log_user_prompt = false
exporter = { otlp-http = { endpoint = "https://ingestion.eu.bronto.io/v1/logs", protocol = "binary", headers = { "x-bronto-api-key" = "<BRONTO_API_KEY>" } } }
```

Codex does not expand `$VAR` in a header value, so the key goes in literally.

</div>
<div class="ship ship-collector">

In `~/.codex/config.toml`:

```toml
[otel]
environment = "production"
log_user_prompt = false
exporter = { otlp-http = { endpoint = "http://localhost:4318/v1/logs", protocol = "binary" } }
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

In `~/.codex/config.toml`:

```toml
[otel]
environment = "production"
log_user_prompt = false
exporter = { otlp-http = { endpoint = "YOUR_OTLP_ENDPOINT/v1/logs", protocol = "binary", headers = { "YOUR_AUTH_HEADER" = "YOUR_AUTH_VALUE" } } }
```

</div>
