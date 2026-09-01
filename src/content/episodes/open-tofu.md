---
title: 'OpenTofu can trace every apply'
tool: 'OpenTofu'
episode: 4
description: 'OpenTofu has emitted OpenTelemetry traces since 1.10, with the exporter switched off. A few environment variables turn on one span per resource instance.'
takeaway: '26 seconds of resource work inside a 10-second apply, and the trace names the resources that set the floor.'
signals: ['traces']
docs: 'https://opentofu.org/docs/internals/tracing/'
video: 'https://www.youtube-nocookie.com/embed/PcG-dpEBzRw'
verified: '2026-08-31'
---

## Switch it on

OpenTofu ships tracing disabled and sends nothing until you name an exporter. Export
these before you run anything; every `tofu` command then emits one trace, with a span per
resource instance. Needs OpenTofu 1.10 or newer, where tracing arrived as an experimental
feature.

<div class="ship ship-bronto">

```bash
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://ingestion.eu.bronto.io/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="x-bronto-api-key=$BRONTO_API_KEY"
export OTEL_SERVICE_NAME=opentofu

tofu apply
```

</div>
<div class="ship ship-collector">

```bash
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_SERVICE_NAME=opentofu

tofu apply
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```bash
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=YOUR_OTLP_ENDPOINT/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="YOUR_AUTH_HEADER=YOUR_AUTH_VALUE"
export OTEL_SERVICE_NAME=opentofu

tofu apply
```

</div>
