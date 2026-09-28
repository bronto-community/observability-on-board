---
title: 'OpenRouter can trace every call'
tool: 'OpenRouter'
episode: 9
description: 'OpenRouter can broadcast a trace of every LLM call to any OpenTelemetry backend. One destination in your workspace settings turns it on.'
takeaway: '17 of 75 first attempts were refused with a 429. Every one was retried on another provider, and the agent never said so.'
signals: ['traces']
docs: 'https://openrouter.ai/docs/guides/features/broadcast/otel-collector'
video: 'https://www.youtube-nocookie.com/embed/th_2V197lb0'
verified: '2026-09-21'
hidden: true
---

## Switch it on

OpenRouter's observability is configured in its web UI. The steps below match the UI as of
the verified date; for the current version, see
[OpenRouter's documentation](https://openrouter.ai/docs/guides/features/broadcast/otel-collector).

1. Open the [OpenRouter settings](https://openrouter.ai/settings/profile) and pick your
   workspace, or stay on Default Workspace.
2. Click **Observability** in the sidebar.
3. Turn **Broadcast** on.
4. Scroll down to **OpenTelemetry Collector** and click **Add Destination**.
5. Fill in **Endpoint** and **Headers** with the values below.
6. Under **Additional generation metadata**, tick **Cost** and **Request context**. Both are
   off by default, and Request context carries the routing data.
7. Click **Add**.

<div class="ship ship-bronto">

Endpoint:

```text
https://ingestion.eu.bronto.io/v1/traces
```

Headers:

```json
{"x-bronto-api-key": "$BRONTO_API_KEY"}
```

</div>
<div class="ship ship-collector">

Endpoint:

```text
https://otel.your-company.com/v1/traces
```

OpenRouter sends from its own servers, so the Collector needs a public HTTPS address. The
[Local Collector setup](/setup/#collector) shows the Collector side.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

Endpoint:

```text
YOUR_OTLP_ENDPOINT/v1/traces
```

Headers:

```json
{"YOUR_AUTH_HEADER": "YOUR_AUTH_VALUE"}
```

</div>
