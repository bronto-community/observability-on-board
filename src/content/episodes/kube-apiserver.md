---
title: 'The Kubernetes API server already traces every request'
tool: 'Kubernetes API server'
episode: 11
description: 'The Kubernetes API server ships with OpenTelemetry tracing. A three-line file and one flag in its static pod manifest turn every request into a trace.'
takeaway: 'A deploy succeeds after 14 seconds with no error, and the trace puts 13.8 of them on one Kyverno webhook call.'
signals: ['traces']
docs: 'https://kubernetes.io/docs/concepts/cluster-administration/system-traces/'
verified: '2026-10-13'
hidden: true
---

## Switch it on

Run a Collector on the control-plane node, then add `/etc/kubernetes/tracing.yaml` there
and point the API server at it in its static pod manifest. Saving the manifest restarts the
API server, and every request after that becomes a trace that includes each admission
webhook it waited on. Needs Kubernetes 1.34 or newer.

<div class="ship ship-bronto">

Save this as `otel-collector.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector
  namespace: kube-system
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: localhost:4317
    exporters:
      otlp_http:
        endpoint: https://ingestion.eu.bronto.io
        headers:
          x-bronto-api-key: ${env:BRONTO_API_KEY}
    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [otlp_http]
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      hostNetwork: true
      nodeSelector:
        node-role.kubernetes.io/control-plane: ""
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector-contrib:0.158.0
        args: [--config=/etc/otelcol/config.yaml]
        envFrom:
        - secretRef:
            name: bronto
        volumeMounts:
        - name: config
          mountPath: /etc/otelcol
      volumes:
      - name: config
        configMap:
          name: otel-collector
```

In a terminal:

```bash
kubectl -n kube-system create secret generic bronto \
  --from-literal=BRONTO_API_KEY="$BRONTO_API_KEY"
kubectl apply -f otel-collector.yaml
```

On the node, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
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

This assumes the [Local Collector](/setup/#collector) running on the control-plane node,
with a `grpc` receiver on `localhost:4317` in place of `http`.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

Save this as `otel-collector.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector
  namespace: kube-system
data:
  config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: localhost:4317
    exporters:
      otlp_http:
        endpoint: YOUR_OTLP_ENDPOINT
        headers:
          YOUR_AUTH_HEADER: YOUR_AUTH_VALUE
    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [otlp_http]
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      hostNetwork: true
      nodeSelector:
        node-role.kubernetes.io/control-plane: ""
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: otel-collector
        image: otel/opentelemetry-collector-contrib:0.158.0
        args: [--config=/etc/otelcol/config.yaml]
        volumeMounts:
        - name: config
          mountPath: /etc/otelcol
      volumes:
      - name: config
        configMap:
          name: otel-collector
```

In a terminal:

```bash
kubectl apply -f otel-collector.yaml
```

On the node, `/etc/kubernetes/tracing.yaml`:

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: TracingConfiguration
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
