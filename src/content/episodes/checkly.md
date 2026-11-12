---
title: 'Checkly can trace every check run'
tool: 'Checkly'
episode: 14
description: 'Checkly can send every check run as a span to any OpenTelemetry backend, where it joins your app''s own trace. One account setting turns it on.'
takeaway: 'Checkly caught the slow homepage. The joined trace put 1.3 s of its 1.47 s on one call to a recommendations service.'
signals: ['traces']
docs: 'https://www.checklyhq.com/docs/resolve/traces/export/'
verified: '2026-10-26'
hidden: true
---

## Switch it on

Checkly's trace export is configured in its settings. Every check run becomes a span, and the
spans your app already sends join it in the same trace.

1. Open **Settings** in Checkly and click **Traces**.
2. Scroll down to **Export Traces** and tick **Enable exporting traces**.
3. Fill in the endpoint with the value below.
4. Under **Headers**, fill in the header name and value.
5. Click **Save**.

<div class="ship ship-bronto">

Endpoint:

```text
https://ingestion.eu.bronto.io/v1/traces
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

Endpoint:

```text
https://otel.your-company.com/v1/traces
```

Checkly runs checks from its own servers, so the Collector needs a public HTTPS address. Skip
the header. The [Local Collector setup](/setup/#collector) shows the Collector side.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

Endpoint:

```text
YOUR_OTLP_ENDPOINT/v1/traces
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
