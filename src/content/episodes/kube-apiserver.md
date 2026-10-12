---
title: 'The Kubernetes API server already traces every request'
tool: 'Kubernetes API server'
episode: 11
description: 'The Kubernetes API server ships with OpenTelemetry tracing. A four-line file and one flag in its static pod manifest turn every request into a trace.'
takeaway: 'A deploy that succeeds after 14 seconds with no error, and the trace puts 13.8 of them on one Kyverno webhook call.'
signals: ['traces']
docs: 'https://kubernetes.io/docs/concepts/cluster-administration/system-traces/'
verified: '2026-10-12'
hidden: true
---

## Switch it on

Start a Collector, then add `/etc/kubernetes/tracing.yaml` on the control-plane node and
point the API server at it in its static pod manifest. Saving the manifest restarts the API
server, and every request after that becomes a trace that includes each admission webhook
it waited on. Needs Kubernetes 1.34 or newer.

<div class="ship ship-bronto">

Save this as `otelcol.yaml` on a host the node can reach as `otel-collector`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
exporters:
  otlphttp:
    endpoint: https://ingestion.eu.bronto.io
    headers:
      x-bronto-api-key: ${env:BRONTO_API_KEY}
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

Run it in a terminal:

```bash
docker run --rm --name otel-collector -p 4317:4317 -e BRONTO_API_KEY \
  -v "$PWD/otelcol.yaml:/etc/otelcol/config.yaml:ro" \
  otel/opentelemetry-collector-contrib:0.158.0 --config=/etc/otelcol/config.yaml
```

On the node, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`:

```diff
    command:
    - kube-apiserver
+   - --tracing-config-file=/etc/kubernetes/tracing.yaml
  …
    volumeMounts:
+   - mountPath: /etc/kubernetes/tracing.yaml
+     name: tracing
  …
  volumes:
+ - hostPath:
+     path: /etc/kubernetes/tracing.yaml
+   name: tracing
```

</div>
<div class="ship ship-collector">

On the node, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`:

```diff
    command:
    - kube-apiserver
+   - --tracing-config-file=/etc/kubernetes/tracing.yaml
  …
    volumeMounts:
+   - mountPath: /etc/kubernetes/tracing.yaml
+     name: tracing
  …
  volumes:
+ - hostPath:
+     path: /etc/kubernetes/tracing.yaml
+   name: tracing
```

This assumes the [Local Collector](/setup/#collector) with a `grpc` receiver and port
4317 added, reachable from the node as `otel-collector`.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

Save this as `otelcol.yaml` on a host the node can reach as `otel-collector`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
exporters:
  otlphttp:
    endpoint: YOUR_OTLP_ENDPOINT
    headers:
      YOUR_AUTH_HEADER: YOUR_AUTH_VALUE
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

Run it in a terminal:

```bash
docker run --rm --name otel-collector -p 4317:4317 \
  -v "$PWD/otelcol.yaml:/etc/otelcol/config.yaml:ro" \
  otel/opentelemetry-collector-contrib:0.158.0 --config=/etc/otelcol/config.yaml
```

On the node, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`:

```diff
    command:
    - kube-apiserver
+   - --tracing-config-file=/etc/kubernetes/tracing.yaml
  …
    volumeMounts:
+   - mountPath: /etc/kubernetes/tracing.yaml
+     name: tracing
  …
  volumes:
+ - hostPath:
+     path: /etc/kubernetes/tracing.yaml
+   name: tracing
```

</div>
