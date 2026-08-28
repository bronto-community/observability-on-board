---
title: 'Docker already traces every build'
tool: 'Docker Buildx'
episode: 2
description: 'BuildKit records a full OpenTelemetry trace of every image build. One builder exports every build''s trace and metrics, using nothing but standard OTEL_* variables.'
takeaway: 'Span names are your Dockerfile steps, and one span name tells you exactly where your cache breaks.'
signals: ['traces', 'metrics']
docs: 'https://docs.docker.com/reference/cli/docker/buildx/history/trace/'
video: 'https://www.youtube-nocookie.com/embed/zclxLor0Rww'
share: 'https://ote.li/with-buildx'
verified: '2026-08-10'
---

## Switch it on

Create a builder with OTel enabled, once. Every build then exports the full trace,
span names matching your Dockerfile steps, plus BuildKit's metrics.

<div class="ship ship-bronto">

```bash
docker buildx create --name otel-builder \
  --driver docker-container \
  --driver-opt env.OTEL_TRACES_EXPORTER=otlp \
  --driver-opt env.OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  --driver-opt env.OTEL_EXPORTER_OTLP_ENDPOINT=https://ingestion.eu.bronto.io \
  --driver-opt env.OTEL_EXPORTER_OTLP_HEADERS=x-bronto-api-key=$BRONTO_API_KEY \
  --driver-opt env.OTEL_SERVICE_NAME=buildx

docker buildx use --default otel-builder
docker buildx build -t myapp .
```

</div>
<div class="ship ship-collector">

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one. On Linux, use
`http://localhost:4318` and add `--driver-opt network=host`.

```bash
docker buildx create --name otel-builder \
  --driver docker-container \
  --driver-opt env.OTEL_TRACES_EXPORTER=otlp \
  --driver-opt env.OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  --driver-opt env.OTEL_EXPORTER_OTLP_ENDPOINT=http://host.docker.internal:4318 \
  --driver-opt env.OTEL_EXPORTER_OTLP_HEADERS=x-otel-auth=none \
  --driver-opt env.OTEL_SERVICE_NAME=buildx

docker buildx use --default otel-builder
docker buildx build -t myapp .
```

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom). BuildKit needs a headers line even without
authentication; a dummy value works.

```bash
docker buildx create --name otel-builder \
  --driver docker-container \
  --driver-opt env.OTEL_TRACES_EXPORTER=otlp \
  --driver-opt env.OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
  --driver-opt env.OTEL_EXPORTER_OTLP_ENDPOINT=YOUR_OTLP_ENDPOINT \
  --driver-opt env.OTEL_EXPORTER_OTLP_HEADERS=YOUR_AUTH_HEADER=YOUR_AUTH_VALUE \
  --driver-opt env.OTEL_SERVICE_NAME=buildx

docker buildx use --default otel-builder
docker buildx build -t myapp .
```

</div>

`use --default` makes plain `docker build` go through this builder too.
