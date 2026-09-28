---
title: 'OpenRouter can trace every call'
tool: 'OpenRouter'
episode: 9
description: 'OpenRouter can broadcast a trace of every LLM call to any OpenTelemetry backend. One destination in your workspace settings turns it on.'
takeaway: '17 of 75 first attempts were refused with a 429. Every one was retried on another provider, and the agent never said so.'
signals: ['traces']
docs: 'https://openrouter.ai/docs/guides/features/broadcast/otel-collector'
verified: '2026-09-21'
hidden: true
---

## Switch it on

Open Observability in your OpenRouter workspace settings, turn Broadcast on and add an
OpenTelemetry Collector destination with these two fields. Every call then arrives as a
trace, with one span per provider attempt. Tick Cost and Request context under Additional
generation metadata: both start off, and Request context carries the routing data.

<div class="ship ship-bronto">

```text
Endpoint: https://ingestion.eu.bronto.io/v1/traces
Headers:  {"x-bronto-api-key": "$BRONTO_API_KEY"}
```

Paste your key in place of `$BRONTO_API_KEY`. The field takes the value as written.

</div>
<div class="ship ship-collector">

```text
Endpoint: https://otel.your-company.com/v1/traces
```

OpenRouter sends from its own servers, so the Collector needs a public HTTPS address, and
`localhost` will not reach it. The [Local Collector setup](/setup/#collector) shows the
Collector side.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```text
Endpoint: YOUR_OTLP_ENDPOINT/v1/traces
Headers:  {"YOUR_AUTH_HEADER": "YOUR_AUTH_VALUE"}
```

</div>
