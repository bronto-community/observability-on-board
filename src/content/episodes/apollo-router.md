---
title: 'Apollo Router already traces every subgraph call'
tool: 'Apollo Router'
episode: 8
description: 'Apollo Router reads one config file, and a telemetry block in it turns every GraphQL operation into a trace with the query plan and every subgraph fetch.'
takeaway: 'The product page takes 261 ms, and 256 ms of it is one subgraph the router could not call until the catalog had answered.'
signals: ['traces', 'metrics']
docs: 'https://www.apollographql.com/docs/graphos/routing/observability/router-telemetry-otel/telemetry-pipelines/trace-exporters/otlp'
verified: '2026-09-14'
hidden: true
---

## Switch it on

Add a `telemetry` key to the `router.yaml` the router already loads. Every client operation
then becomes one trace, with a span per query-plan node and per subgraph fetch. Set
`protocol: http`, the default is gRPC, and leave each `endpoint` bare, the router appends
`/v1/traces` and `/v1/metrics` itself. Environment variables are not an option: since
v2.13.0 the router refuses to start when any `OTEL_EXPORTER_OTLP_*` variable is set.

<div class="ship ship-bronto">

```yaml
telemetry:
  exporters:
    tracing:
      otlp:
        enabled: true
        protocol: http
        endpoint: https://ingestion.eu.bronto.io
        http:
          headers:
            x-bronto-api-key: ${env.BRONTO_API_KEY}
      common:
        service_name: storefront-router
    metrics:
      otlp:
        enabled: true
        protocol: http
        endpoint: https://ingestion.eu.bronto.io
        http:
          headers:
            x-bronto-api-key: ${env.BRONTO_API_KEY}
      common:
        service_name: storefront-router
```

The router expands `${env.BRONTO_API_KEY}` from its own process environment, so under
Compose the key belongs in the router service's `environment:`. Without it the router starts
cleanly and exports nothing.

</div>
<div class="ship ship-collector">

```yaml
telemetry:
  exporters:
    tracing:
      otlp:
        enabled: true
        protocol: http
        endpoint: http://localhost:4318
      common:
        service_name: storefront-router
    metrics:
      otlp:
        enabled: true
        protocol: http
        endpoint: http://localhost:4318
      common:
        service_name: storefront-router
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```yaml
telemetry:
  exporters:
    tracing:
      otlp:
        enabled: true
        protocol: http
        endpoint: YOUR_OTLP_ENDPOINT
        http:
          headers:
            YOUR_AUTH_HEADER: YOUR_AUTH_VALUE
      common:
        service_name: storefront-router
    metrics:
      otlp:
        enabled: true
        protocol: http
        endpoint: YOUR_OTLP_ENDPOINT
        http:
          headers:
            YOUR_AUTH_HEADER: YOUR_AUTH_VALUE
      common:
        service_name: storefront-router
```

</div>
