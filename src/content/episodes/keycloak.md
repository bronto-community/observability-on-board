---
title: 'Keycloak can trace every login'
tool: 'Keycloak'
episode: 3
description: 'Since Keycloak 26, OpenTelemetry ships inside the server. A few lines in keycloak.conf export traces, logs and metrics for every login and token grant.'
takeaway: 'One login is 28 spans, and the database is 0.7% of it. The trace shows where the other 99% goes.'
signals: ['traces', 'metrics', 'logs']
docs: 'https://www.keycloak.org/observability/tracing'
video: 'https://www.youtube-nocookie.com/embed/7f6PlBkxQCY'
verified: '2026-08-13'
---

## Switch it on

Add these lines to `conf/keycloak.conf` and restart. Traces for every request down to
the SQL statement, Keycloak's own logs with trace ids attached, and metrics. Tracing
and logs are preview features, metrics experimental.

<div class="ship ship-bronto">

```ini
features=opentelemetry,opentelemetry-logs,opentelemetry-metrics
tracing-enabled=true
telemetry-logs-enabled=true
metrics-enabled=true
telemetry-metrics-enabled=true
telemetry-protocol=http/protobuf
# host only: Keycloak appends /v1/traces, /v1/logs, /v1/metrics itself
telemetry-endpoint=https://ingestion.eu.bronto.io
telemetry-header-x-bronto-api-key=${BRONTO_API_KEY}
telemetry-service-name=sso
```

Keycloak fills `${BRONTO_API_KEY}` from the environment at boot.

</div>
<div class="ship ship-collector">

```ini
features=opentelemetry,opentelemetry-logs,opentelemetry-metrics
tracing-enabled=true
telemetry-logs-enabled=true
metrics-enabled=true
telemetry-metrics-enabled=true
telemetry-protocol=http/protobuf
telemetry-endpoint=http://localhost:4318
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one. From Docker, use
`http://host.docker.internal:4318`.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```ini
features=opentelemetry,opentelemetry-logs,opentelemetry-metrics
tracing-enabled=true
telemetry-logs-enabled=true
metrics-enabled=true
telemetry-metrics-enabled=true
telemetry-protocol=http/protobuf
# host only: Keycloak appends /v1/traces, /v1/logs, /v1/metrics itself
telemetry-endpoint=YOUR_OTLP_ENDPOINT
telemetry-header-YOUR_AUTH_HEADER=YOUR_AUTH_VALUE
```

</div>
