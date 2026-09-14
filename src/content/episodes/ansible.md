---
title: 'Ansible already traces every task'
tool: 'Ansible'
episode: 6
description: 'Ansible ships an OpenTelemetry callback plugin in community.general. One pip install and three lines in ansible.cfg turn every play into a trace, one span per task per host.'
takeaway: 'Three hosts finish every task in under a second; the fourth takes the whole 13-second play, and the trace names it.'
signals: ['traces']
docs: 'https://docs.ansible.com/ansible/latest/collections/community/general/opentelemetry_callback.html'
verified: '2026-09-14'
hidden: true
---

## Switch it on

The callback plugin ships in `community.general`, which the `ansible` package installs. It
imports the OpenTelemetry Python SDK, which Ansible does not ship, so that gets installed
first. The plugin is switched on in `ansible.cfg`; the endpoint and the auth header are the
standard OpenTelemetry variables, because the plugin has no config-file key for them. Every
play then becomes one trace, with a span per task per host that carries the host name, the
module and the result. Needs `community.general` 9.0 or newer for the protocol line; older
versions read `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL=http/protobuf` from the environment
instead.

<div class="ship ship-bronto">

On the controller, once:

```bash
pip install opentelemetry-exporter-otlp
```

In the `ansible.cfg` next to the playbook:

```ini
[defaults]
callbacks_enabled = community.general.opentelemetry

[callback_opentelemetry]
otel_exporter_otlp_traces_protocol = http/protobuf
otel_service_name = ansible
```

In the shell or CI job that runs the play, a bastion's `.envrc` for example:

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://ingestion.eu.bronto.io/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="x-bronto-api-key=$BRONTO_API_KEY"

ansible-playbook site.yml
```

The protocol line is required: the default is gRPC, and without it the play exits 0 and
exports nothing.

</div>
<div class="ship ship-collector">

On the controller, once:

```bash
pip install opentelemetry-exporter-otlp
```

In the `ansible.cfg` next to the playbook:

```ini
[defaults]
callbacks_enabled = community.general.opentelemetry

[callback_opentelemetry]
otel_exporter_otlp_traces_protocol = http/protobuf
otel_service_name = ansible
```

In the shell or CI job that runs the play, a bastion's `.envrc` for example:

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces

ansible-playbook site.yml
```

This assumes a Collector listening on `localhost:4318`; the
[Local Collector setup](/setup/#collector) shows how to start one.

</div>
<div class="ship ship-custom">

This uses the endpoint and auth header you saved in the
[setup guide](/setup/#custom).

On the controller, once:

```bash
pip install opentelemetry-exporter-otlp
```

In the `ansible.cfg` next to the playbook:

```ini
[defaults]
callbacks_enabled = community.general.opentelemetry

[callback_opentelemetry]
otel_exporter_otlp_traces_protocol = http/protobuf
otel_service_name = ansible
```

In the shell or CI job that runs the play, a bastion's `.envrc` for example:

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=YOUR_OTLP_ENDPOINT/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="YOUR_AUTH_HEADER=YOUR_AUTH_VALUE"

ansible-playbook site.yml
```

</div>
