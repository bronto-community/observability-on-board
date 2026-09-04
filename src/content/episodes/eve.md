---
title: 'eve already traces every agent turn'
tool: 'eve'
episode: 5
description: 'eve runs `agent/instrumentation.ts` at startup, and creating that file is what turns telemetry on. One file traces every turn, model step and tool call.'
takeaway: 'Every model call reads ~7,000 tokens and writes ~200, a 30:1 ratio on every step of every turn.'
signals: ['traces']
docs: 'https://eve.dev/docs/guides/instrumentation'
video: 'https://www.youtube-nocookie.com/embed/yZkz4xDFrS4'
verified: '2026-09-04'
---

## Switch it on

Create `agent/instrumentation.ts`. eve finds it by name and runs it at startup, before any
agent code, and there is no enable flag to set. Traces cover every turn, each model step with
its token counts, and each tool call. Keep the endpoint in the file rather than in
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`: the workflow runtime bundles its own OTel SDK, which
reads that variable and exports every span again without your headers.

<div class="ship ship-bronto">

```bash
npm i @vercel/otel @opentelemetry/exporter-trace-otlp-http
```

```ts
import { registerOTel } from "@vercel/otel";
import { defineInstrumentation } from "eve/instrumentation";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export default defineInstrumentation({
  traceChannelRequests: true,
  setup: ({ agentName }) =>
    registerOTel({
      serviceName: agentName,
      traceExporter: new OTLPTraceExporter({
        url: "https://ingestion.eu.bronto.io/v1/traces",
        headers: { "x-bronto-api-key": process.env.BRONTO_API_KEY ?? "" },
      }),
    }),
});
```

</div>
<div class="ship ship-collector">

```bash
npm i @vercel/otel @opentelemetry/exporter-trace-otlp-http
```

```ts
import { registerOTel } from "@vercel/otel";
import { defineInstrumentation } from "eve/instrumentation";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export default defineInstrumentation({
  traceChannelRequests: true,
  setup: ({ agentName }) =>
    registerOTel({
      serviceName: agentName,
      traceExporter: new OTLPTraceExporter({
        url: "http://localhost:4318/v1/traces",
      }),
    }),
});
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```bash
npm i @vercel/otel @opentelemetry/exporter-trace-otlp-http
```

```ts
import { registerOTel } from "@vercel/otel";
import { defineInstrumentation } from "eve/instrumentation";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export default defineInstrumentation({
  traceChannelRequests: true,
  setup: ({ agentName }) =>
    registerOTel({
      serviceName: agentName,
      traceExporter: new OTLPTraceExporter({
        url: "YOUR_OTLP_ENDPOINT/v1/traces",
        headers: { "YOUR_AUTH_HEADER": "YOUR_AUTH_VALUE" },
      }),
    }),
});
```

</div>
