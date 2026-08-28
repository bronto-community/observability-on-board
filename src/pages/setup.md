---
layout: ../layouts/MarkdownLayout.astro
title: 'Set up your telemetry target'
description: 'Every episode ships telemetry over plain OTLP, so it works with whichever target you pick here. Set yours up once and the episodes adapt.'
---

<div class="ship ship-bronto" id="bronto">

## Ship to Bronto

You need an account at [bronto.io](https://bronto.io) and an API key with ingest
permission, created in the Bronto app under your organisation's API keys. Export it in
the shell you work from:

```bash
export BRONTO_API_KEY=<your key>
```

The episodes never put the key itself into a config file or command line. It always
travels as the environment variable.

Ingest endpoints, by region:

| Region | Endpoint |
|---|---|
| EU | `https://ingestion.eu.bronto.io` |
| US | `https://ingestion.us.bronto.io` |

Pick your region with the EU/US toggle next to the Bronto button; every Bronto code
block follows it. Requests authenticate with the `x-bronto-api-key` header, and each
episode shows the tool-native way to set it.

Two routing facts are worth knowing up front. Bronto turns `service.name` into the
dataset name, which is why the episodes name services deliberately. And traces always
land in the `.traces` collection while logs land in `default`, so one tool can
legitimately show up in two places.

To confirm data arrived, run an episode and check for the new dataset in the Bronto app.
Instrumentation fails silently in almost every tool we have covered, so treat a clean
start as no evidence. Data in the dataset is the only confirmation.

</div>
<div class="ship ship-collector" id="collector">

## Ship to a local Collector

The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) is a small
process that receives OTLP and forwards it wherever you tell it. Here it forwards to its
own log output, so you can watch what a tool actually emits. Docker is the only
requirement.

Save this as `otelcol.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: normal
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Run it:

```bash
docker run --rm -p 4318:4318 \
  -v "$PWD/otelcol.yaml:/etc/otelcol-contrib/config.yaml" \
  otel/opentelemetry-collector-contrib:latest
```

Confirm it works with a hand-made span:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H 'Content-Type: application/json' \
  -d '{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"hello"}}]},"scopeSpans":[{"spans":[{"traceId":"5b8efff798038103d269b633813fc60c","spanId":"eee19b7ec3c1b174","name":"hello-span","kind":1,"startTimeUnixNano":"1756290000000000000","endTimeUnixNano":"1756290000120000000"}]}]}]}'
```

The Collector's terminal prints the span summary a moment later. From here, every episode
points its tool at `http://localhost:4318`, or at `http://host.docker.internal:4318`
when the tool itself runs in Docker on macOS or Windows.

<details>
<summary>Keep the data in a file instead of the terminal</summary>

Swap the `debug` exporter for the `file` exporter and everything lands on disk as OTLP
JSON, one document per line:

```yaml
exporters:
  file:
    path: /data/telemetry.jsonl
```

Replace `debug` with `file` in the pipelines, create a `telemetry` directory, and add
`-v "$PWD/telemetry:/data"` to the `docker run` command. Two `jq` starting points for
reading the result:

```bash
# every span name
jq -r '.resourceSpans[].scopeSpans[].spans[].name' telemetry/telemetry.jsonl

# span names with durations in ms
jq -r '.resourceSpans[].scopeSpans[].spans[]
  | "\((((.endTimeUnixNano|tonumber) - (.startTimeUnixNano|tonumber)) / 1000000))ms \(.name)"' \
  telemetry/telemetry.jsonl
```

For browsing traces in a UI without signing up for anything,
[otel-desktop-viewer](https://github.com/CtrlSpice/otel-desktop-viewer) is an
open-source local viewer that accepts the same OTLP.

</details>

</div>
<div class="ship ship-custom" id="custom">

## Bring your own endpoint

You may already have somewhere for telemetry to go: another vendor, a Collector your
platform team runs, a gateway in your cluster. Enter its OTLP details here and every
episode on this site rewrites its code blocks to use them.

<form id="otlp-form" class="otlp-form">
  <label>OTLP endpoint (HTTP)
    <input name="endpoint" type="url" placeholder="https://otlp.example.com" required />
  </label>
  <label>Auth header name (optional)
    <input name="header" type="text" placeholder="x-example-api-key" />
  </label>
  <label>Auth header value (optional)
    <input name="value" type="password" placeholder="your key or token" />
  </label>
  <span class="buttons">
    <button type="submit">Save in this browser</button>
    <button type="button" class="secondary" id="otlp-clear">Clear</button>
  </span>
  <p class="form-note">Stored only in this browser's local storage. Nothing is sent anywhere.</p>
</form>

Three things to check against your vendor's OTLP documentation:

- The endpoint must speak OTLP over HTTP with protobuf, the flavour every episode here
  uses. An endpoint documented only for gRPC (often port 4317) will not work as-is.
- Enter the base URL without `/v1/traces`. Each episode adds or omits the path the way
  its tool expects.
- The header name and value are whatever your vendor uses for authentication. Leave both
  empty if your endpoint is unauthenticated; the episodes then drop the header line, or
  use a dummy value where the tool requires one.

Until you save values here, the episodes show `YOUR_OTLP_ENDPOINT`, `YOUR_AUTH_HEADER`
and `YOUR_AUTH_VALUE` as placeholders you can replace by hand.

</div>
