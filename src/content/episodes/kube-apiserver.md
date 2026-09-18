---
title: 'The Kubernetes API server already traces every request'
tool: 'Kubernetes API server'
episode: 10
description: 'Kubernetes has traced every API server request since 1.27. A four-line file and one flag in the static pod manifest turn each request into a trace.'
takeaway: 'The same Deployment takes 5 ms in one namespace and 157 ms in the next, and the trace names the validating webhook that cost the difference.'
signals: ['traces']
docs: 'https://kubernetes.io/docs/concepts/cluster-administration/system-traces/'
verified: '2026-09-15'
hidden: true
---

## Switch it on

Two files on the control-plane node. `/etc/kubernetes/tracing.yaml` holds the endpoint and
the sampling rate, and `--tracing-config-file` in the static pod manifest points the API
server at it. The kubelet watches that directory, so saving the manifest is what restarts the
API server, and `kubectl` is refused for about 45 seconds while it does. The API server
speaks OTLP over gRPC and has no field for a header, so it always sends to a Collector, which
holds the key. Every request then becomes a trace through the filter chain, admission with
each webhook named, and the etcd transaction. Needs Kubernetes 1.27 or newer, where the two
files became the whole change.

<div class="ship ship-bronto">

Save this as `otelcol.yaml` on a host the control-plane node can reach as `otel-collector`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 2s
  resource:
    attributes:
      - key: service.name
        value: kube-apiserver
        action: upsert

exporters:
  otlphttp/bronto:
    traces_endpoint: https://ingestion.eu.bronto.io/v1/traces
    headers:
      x-bronto-api-key: ${env:BRONTO_API_KEY}

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resource, batch]
      exporters: [otlphttp/bronto]
```

Run it with the key in the environment:

```bash
docker run --rm --name otel-collector -p 4317:4317 -e BRONTO_API_KEY \
  -v "$PWD/otelcol.yaml:/etc/otelcol/config.yaml:ro" \
  otel/opentelemetry-collector-contrib:0.158.0 --config=/etc/otelcol/config.yaml
```

On the control-plane node, a new file, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`, the file the kubelet watches:

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

`samplingRatePerMillion` defaults to 0, which starts cleanly and exports nothing.
`1000000` is every request, and a busy cluster wants a smaller number.

</div>
<div class="ship ship-collector">

On the control-plane node, a new file, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`, the file the kubelet watches:

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

This assumes a Collector listening on `otel-collector:4317`; the
[Local Collector setup](/setup/#collector) shows how to start one. The API server speaks
OTLP over gRPC, so that Collector needs an `otlp` receiver with a `grpc` protocol on 4317,
not the `http` one on 4318.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

Save this as `otelcol.yaml` on a host the control-plane node can reach as `otel-collector`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 2s
  resource:
    attributes:
      - key: service.name
        value: kube-apiserver
        action: upsert

exporters:
  otlphttp/custom:
    traces_endpoint: YOUR_OTLP_ENDPOINT/v1/traces
    headers:
      YOUR_AUTH_HEADER: YOUR_AUTH_VALUE

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [resource, batch]
      exporters: [otlphttp/custom]
```

Run it:

```bash
docker run --rm --name otel-collector -p 4317:4317 \
  -v "$PWD/otelcol.yaml:/etc/otelcol/config.yaml:ro" \
  otel/opentelemetry-collector-contrib:0.158.0 --config=/etc/otelcol/config.yaml
```

On the control-plane node, a new file, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
endpoint: otel-collector:4317
samplingRatePerMillion: 1000000
```

In `/etc/kubernetes/manifests/kube-apiserver.yaml`, the file the kubelet watches:

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
