---
title: 'n8n can trace every workflow'
tool: 'n8n'
episode: 14
description: 'n8n can send workflow and node spans to any OpenTelemetry backend. One settings page turns it on.'
takeaway: '292 of 300 HTTP calls in one workflow run were waiting for a database connection, up to 4.7 s.'
signals: ['traces']
docs: 'https://docs.n8n.io/hosting/logging-monitoring/opentelemetry/'
video: 'https://www.youtube-nocookie.com/embed/vJiA-wlOkGY'
verified: '2026-10-30'
---

## Switch it on

n8n's observability is configured in its settings.

1. Open **Settings** and click **OpenTelemetry** in the sidebar.
2. Click **Enable**.
3. Fill in **OTLP endpoint** with the value below.
4. Under **Custom headers**, click **Add header** and fill in **Key** and **Value**.
5. Click **Save settings**.

<div class="ship ship-bronto">

OTLP endpoint:

```text
https://ingestion.eu.bronto.io
```

Key:

```text
x-bronto-api-key
```

Value:

```text
$BRONTO_API_KEY
```

</div>
<div class="ship ship-collector">

OTLP endpoint:

```text
http://localhost:4318
```

Skip the custom header. The [Local Collector setup](/setup/#collector) shows the Collector
side.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

OTLP endpoint:

```text
YOUR_OTLP_ENDPOINT
```

Key:

```text
YOUR_AUTH_HEADER
```

Value:

```text
YOUR_AUTH_VALUE
```

</div>
