---
title: 'Maven can trace every module and goal'
tool: 'Maven'
episode: 11
description: "Maven's OpenTelemetry extension loads from .mvn/extensions.xml. Three lines in .mvn/maven.config give you one span per module and per plugin goal."
takeaway: 'Four threads take the build from 32 seconds to 19; eight threads change nothing, and the trace names the chain that sets the floor.'
signals: ['traces']
docs: 'https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/maven-extension/README.md'
verified: '2026-09-15'
hidden: true
---

## Switch it on

The OpenTelemetry Maven extension is a contrib artifact that Maven's own core extension
mechanism loads, so there is no agent, no pom change and nothing to install: Maven resolves
the jar from Central on the next build. The whole configuration is two files in `.mvn/`, one
that declares the extension and one that carries three `-D` lines, and the API key stays in
the environment, because neither file expands shell variables. Every `mvn` run then becomes
one trace, with a span per reactor module and a span per plugin goal carrying the plugin, the
goal and the lifecycle phase.

<div class="ship ship-bronto">

In `.mvn/extensions.xml` in the project root:

```xml
<extensions>
  <extension>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-maven-extension</artifactId>
    <version>1.60.0-alpha</version>
  </extension>
</extensions>
```

In `.mvn/maven.config` next to it:

```ini
-Dotel.exporter.otlp.endpoint=https://ingestion.eu.bronto.io
-Dotel.exporter.otlp.protocol=http/protobuf
-Dotel.service.name=apato-platform
```

In the shell or CI job that runs the build:

```bash
export OTEL_EXPORTER_OTLP_HEADERS="x-bronto-api-key=$BRONTO_API_KEY"

mvn package
```

The protocol line is required: the SDK default is gRPC, and without it the build exits 0 and
exports nothing.

</div>
<div class="ship ship-collector">

In `.mvn/extensions.xml` in the project root:

```xml
<extensions>
  <extension>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-maven-extension</artifactId>
    <version>1.60.0-alpha</version>
  </extension>
</extensions>
```

In `.mvn/maven.config` next to it:

```ini
-Dotel.exporter.otlp.endpoint=http://localhost:4318
-Dotel.exporter.otlp.protocol=http/protobuf
-Dotel.service.name=apato-platform
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

In `.mvn/extensions.xml` in the project root:

```xml
<extensions>
  <extension>
    <groupId>io.opentelemetry.contrib</groupId>
    <artifactId>opentelemetry-maven-extension</artifactId>
    <version>1.60.0-alpha</version>
  </extension>
</extensions>
```

In `.mvn/maven.config` next to it:

```ini
-Dotel.exporter.otlp.endpoint=YOUR_OTLP_ENDPOINT
-Dotel.exporter.otlp.protocol=http/protobuf
-Dotel.service.name=apato-platform
```

In the shell or CI job that runs the build:

```bash
export OTEL_EXPORTER_OTLP_HEADERS="YOUR_AUTH_HEADER=YOUR_AUTH_VALUE"

mvn package
```

</div>
