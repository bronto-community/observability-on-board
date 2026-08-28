---
title: 'Claude Code has observability built in'
tool: 'Claude Code'
episode: 1
description: 'Claude Code ships an OpenTelemetry exporter for metrics, events and traces. One settings file turns all of it on, for one developer or a whole organisation.'
takeaway: 'Tokens, cost, tool decisions and every LLM request, exported with one settings file.'
signals: ['traces', 'metrics', 'logs']
docs: 'https://code.claude.com/docs/en/monitoring-usage'
blog: 'https://bronto.io/blog/sending-logs-from-claude-code-to-bronto'
video: 'https://www.youtube-nocookie.com/embed/9bP1stHfATg'
share: 'https://ote.li/with-claude'
verified: '2026-08-27'
---

## Switch it on

Add this to `~/.claude/settings.json`. Every session from the next one on exports
metrics, events and traces. Traces are beta; `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA`
opts in.

<div class="ship ship-bronto">

<div class="knob-tabs">
  <button data-knob="basic" aria-pressed="true">Essentials</button>
  <button data-knob="full" aria-pressed="false">+16 more options</button>
</div>

<div class="knob-basic">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "https://ingestion.eu.bronto.io",
    "OTEL_EXPORTER_OTLP_HEADERS": "x-bronto-api-key=<BRONTO_API_KEY>,x-bronto-dataset=claude-code"
  }
}
```

</div>
<div class="knob-full">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "https://ingestion.eu.bronto.io",
    "OTEL_EXPORTER_OTLP_HEADERS": "x-bronto-api-key=<BRONTO_API_KEY>,x-bronto-dataset=claude-code",

    "OTEL_METRIC_EXPORT_INTERVAL": "10000",
    "OTEL_LOGS_EXPORT_INTERVAL": "5000",
    "OTEL_TRACES_EXPORT_INTERVAL": "5000",

    "OTEL_LOG_USER_PROMPTS": "0",
    "OTEL_LOG_ASSISTANT_RESPONSES": "0",
    "OTEL_LOG_TOOL_DETAILS": "0",
    "OTEL_LOG_TOOL_CONTENT": "0",
    "OTEL_LOG_RAW_API_BODIES": "0",
    "CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH": "1048576",

    "OTEL_METRICS_INCLUDE_SESSION_ID": "true",
    "OTEL_METRICS_INCLUDE_VERSION": "true",
    "OTEL_METRICS_INCLUDE_ACCOUNT_UUID": "true",
    "OTEL_METRICS_INCLUDE_ENTRYPOINT": "true",
    "OTEL_METRICS_INCLUDE_RESOURCE_ATTRIBUTES": "true",

    "CLAUDE_CODE_PROPAGATE_TRACEPARENT": "1",
    "CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL": "1"
  }
}
```

The groups after the destination: export cadence, what event content is captured,
which attributes ride on metrics, and trace-context propagation. Delete what you
don't want; the [docs](https://code.claude.com/docs/en/monitoring-usage) describe
every variable.

</div>

The file can't expand shell variables, so paste the key literally and use one that
can only ingest. `x-bronto-dataset` names the dataset.

</div>
<div class="ship ship-collector">

<div class="knob-tabs">
  <button data-knob="basic" aria-pressed="true">Essentials</button>
  <button data-knob="full" aria-pressed="false">+16 more options</button>
</div>

<div class="knob-basic">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318"
  }
}
```

</div>
<div class="knob-full">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",

    "OTEL_METRIC_EXPORT_INTERVAL": "10000",
    "OTEL_LOGS_EXPORT_INTERVAL": "5000",
    "OTEL_TRACES_EXPORT_INTERVAL": "5000",

    "OTEL_LOG_USER_PROMPTS": "0",
    "OTEL_LOG_ASSISTANT_RESPONSES": "0",
    "OTEL_LOG_TOOL_DETAILS": "0",
    "OTEL_LOG_TOOL_CONTENT": "0",
    "OTEL_LOG_RAW_API_BODIES": "0",
    "CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH": "1048576",

    "OTEL_METRICS_INCLUDE_SESSION_ID": "true",
    "OTEL_METRICS_INCLUDE_VERSION": "true",
    "OTEL_METRICS_INCLUDE_ACCOUNT_UUID": "true",
    "OTEL_METRICS_INCLUDE_ENTRYPOINT": "true",
    "OTEL_METRICS_INCLUDE_RESOURCE_ATTRIBUTES": "true",

    "CLAUDE_CODE_PROPAGATE_TRACEPARENT": "1",
    "CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL": "1"
  }
}
```

The groups after the destination: export cadence, what event content is captured,
which attributes ride on metrics, and trace-context propagation. Delete what you
don't want; the [docs](https://code.claude.com/docs/en/monitoring-usage) describe
every variable.

</div>

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

<div class="knob-tabs">
  <button data-knob="basic" aria-pressed="true">Essentials</button>
  <button data-knob="full" aria-pressed="false">+16 more options</button>
</div>

<div class="knob-basic">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_HEADERS": "YOUR_AUTH_HEADER=YOUR_AUTH_VALUE",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "YOUR_OTLP_ENDPOINT"
  }
}
```

</div>
<div class="knob-full">

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_TRACES_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_HEADERS": "YOUR_AUTH_HEADER=YOUR_AUTH_VALUE",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "YOUR_OTLP_ENDPOINT",

    "OTEL_METRIC_EXPORT_INTERVAL": "10000",
    "OTEL_LOGS_EXPORT_INTERVAL": "5000",
    "OTEL_TRACES_EXPORT_INTERVAL": "5000",

    "OTEL_LOG_USER_PROMPTS": "0",
    "OTEL_LOG_ASSISTANT_RESPONSES": "0",
    "OTEL_LOG_TOOL_DETAILS": "0",
    "OTEL_LOG_TOOL_CONTENT": "0",
    "OTEL_LOG_RAW_API_BODIES": "0",
    "CLAUDE_CODE_OTEL_CONTENT_MAX_LENGTH": "1048576",

    "OTEL_METRICS_INCLUDE_SESSION_ID": "true",
    "OTEL_METRICS_INCLUDE_VERSION": "true",
    "OTEL_METRICS_INCLUDE_ACCOUNT_UUID": "true",
    "OTEL_METRICS_INCLUDE_ENTRYPOINT": "true",
    "OTEL_METRICS_INCLUDE_RESOURCE_ATTRIBUTES": "true",

    "CLAUDE_CODE_PROPAGATE_TRACEPARENT": "1",
    "CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL": "1"
  }
}
```

The groups after the destination: export cadence, what event content is captured,
which attributes ride on metrics, and trace-context propagation. Delete what you
don't want; the [docs](https://code.claude.com/docs/en/monitoring-usage) describe
every variable.

</div>

The endpoint is the base URL of your OTLP HTTP endpoint, without `/v1/traces`; Claude
Code appends the per-signal paths itself.

</div>

For a whole organisation, put the same `env` block into Claude Code's managed
settings file: `/Library/Application Support/ClaudeCode/managed-settings.json` on
macOS; the [docs](https://code.claude.com/docs/en/monitoring-usage) list the other
platforms.
