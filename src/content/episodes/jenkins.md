---
title: 'Jenkins can trace every build'
tool: 'Jenkins'
episode: 9
description: 'Jenkins has an OpenTelemetry plugin in the update centre. One block in the jenkins.yaml the controller already boots from turns every build into a trace.'
takeaway: 'The pipeline with the least work is the slowest build: 26 of its 35 seconds are one span, waiting for an executor.'
signals: ['traces', 'metrics', 'logs']
docs: 'https://github.com/jenkinsci/opentelemetry-plugin/blob/master/docs/setup-and-configuration.md'
verified: '2026-09-15'
hidden: true
---

## Switch it on

Install the `opentelemetry` plugin from the update centre, then add an `openTelemetry:`
block to the `jenkins.yaml` the controller already boots from. Every build becomes one trace:
the build as the root span, a span per stage and per step, and one span for the time it
waited for an executor. The protocol line is not optional, the plugin's default is gRPC.

<div class="ship ship-bronto">

```yaml
unclassified:
  openTelemetry:
    endpoint: https://ingestion.eu.bronto.io
    authentication:
      otlpHeaderAuthentication:
        headerName: x-bronto-api-key
        headerValueId: bronto-api-key
    configurationProperties: |
      otel.exporter.otlp.protocol=http/protobuf
    serviceName: ci-controller

credentials:
  system:
    domainCredentials:
      - credentials:
          - string:
              id: bronto-api-key
              secret: ${BRONTO_API_KEY}
```

`BRONTO_API_KEY` comes from the controller's own environment. Restart it after the edit, a
Configuration as Code reload updates the plugin's form and leaves the exporter as it was.

</div>
<div class="ship ship-collector">

```yaml
unclassified:
  openTelemetry:
    endpoint: http://localhost:4318
    configurationProperties: |
      otel.exporter.otlp.protocol=http/protobuf
    serviceName: ci-controller
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one. Restart the controller
after the edit, a Configuration as Code reload does not reach the exporter.

</div>
<div class="ship ship-custom" data-empty-auth="dummy">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

```yaml
unclassified:
  openTelemetry:
    endpoint: YOUR_OTLP_ENDPOINT
    authentication:
      otlpHeaderAuthentication:
        headerName: YOUR_AUTH_HEADER
        headerValueId: otlp-auth
    configurationProperties: |
      otel.exporter.otlp.protocol=http/protobuf
    serviceName: ci-controller

credentials:
  system:
    domainCredentials:
      - credentials:
          - string:
              id: otlp-auth
              secret: YOUR_AUTH_VALUE
```

Restart the controller. A Configuration as Code reload updates the plugin's form and leaves
the exporter as it was.

</div>
