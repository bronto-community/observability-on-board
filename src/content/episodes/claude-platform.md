---
title: 'Claude Platform can trace every agent step'
tool: 'Claude Platform'
episode: 13
description: 'Claude Platform can trace every Messages API request and Managed Agents session to any OpenTelemetry backend. One Console destination turns it on.'
takeaway: 'The answer looked fine. The trace showed the agent''s first command had failed.'
signals: ['traces']
docs: 'https://platform.claude.com/docs/en/manage-claude/opentelemetry/api'
video: 'https://www.youtube-nocookie.com/embed/bPddVU0DJUQ'
verified: '2026-10-16'
---

## Switch it on

Claude Platform's OpenTelemetry export is configured in the Claude Console and needs the
organization admin role.

1. Open [Settings → OpenTelemetry](https://platform.claude.com/settings/telemetry-destinations)
   in the Claude Console.
2. Click **Add destination** and leave **Provider** on **Custom**.
3. Fill in **OTLP endpoint URL** and one **Request header** with the values below.
4. Under **Content mode**, pick **Full content** to get prompts and outputs on the spans.
5. Click **Add destination**.

<div class="ship ship-bronto">

OTLP endpoint URL:

```text
https://ingestion.eu.bronto.io
```

Header name:

```text
x-bronto-api-key
```

Header value:

```text
$BRONTO_API_KEY
```

</div>
<div class="ship ship-collector">

OTLP endpoint URL:

```text
https://otel.your-company.com
```

Anthropic sends from its own servers, so the Collector needs a public HTTPS address on port
443. The [Local Collector setup](/setup/#collector) shows the Collector side.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

OTLP endpoint URL:

```text
YOUR_OTLP_ENDPOINT
```

Header name:

```text
YOUR_AUTH_HEADER
```

Header value:

```text
YOUR_AUTH_VALUE
```

</div>
