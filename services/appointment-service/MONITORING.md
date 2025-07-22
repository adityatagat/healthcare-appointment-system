# Monitoring Setup for Appointment Service

This document outlines the monitoring and observability setup for the Appointment Service.

## Metrics Collection

The service exposes Prometheus metrics at the `/metrics` endpoint. The following metrics are available:

- **HTTP Request Duration**: Histogram of HTTP request durations
  - Labels: `method`, `route`, `status_code`
- **HTTP Request Count**: Counter of HTTP requests
  - Labels: `method`, `route`, `status_code`
- **Active Requests**: Gauge of currently active requests
- **Database Query Duration**: Histogram of database query durations
- **Error Count**: Counter of errors by type

## Health Checks

The service provides a health check endpoint at `/health` that returns:
- Service status
- Database connection status
- Memory usage
- Uptime

## Logging

Logs are written to the console in JSON format with the following fields:
- `timestamp`: ISO 8601 timestamp
- `level`: Log level (error, warn, info, debug)
- `message`: Log message
- `service`: Service name
- `environment`: Current environment (development/production)
- Additional context-specific fields

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `METRICS_ENABLED` | Enable/disable metrics collection | `true` |
| `METRICS_PATH` | Path for metrics endpoint | `/metrics` |
| `LOG_LEVEL` | Minimum log level | `info` |
| `PROMETHEUS_SERVER_PORT` | Port for Prometheus metrics | `3000` |

## Docker Configuration

The Docker setup includes:
- Health checks with proper timeouts and retries
- Volume mounts for logs
- Resource limits
- Proper signal handling with `tini`

## Monitoring Stack

The service is integrated with the following monitoring tools:

1. **Prometheus**: For metrics collection and alerting
2. **Grafana**: For visualization of metrics
3. **Loki**: For log aggregation
4. **Alertmanager**: For alert routing and notification

## Development

To run the service with monitoring locally:

```bash
docker-compose up -d
```

Access the monitoring tools:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100

## Alerts

Alerts are configured in the Prometheus configuration to notify on:
- Service down
- High error rates
- High latency
- Database connection issues

## Performance Considerations

- Metrics collection adds minimal overhead
- Logs are written asynchronously to minimize impact on request processing
- Sampling can be configured for high-volume logs

## Troubleshooting

Common issues and solutions:

1. **Metrics not appearing in Prometheus**
   - Verify the service is running and accessible
   - Check the `/metrics` endpoint directly
   - Verify Prometheus service discovery configuration

2. **High memory usage**
   - Check for memory leaks in application code
   - Adjust Prometheus scrape interval if needed
   - Review log levels and verbosity

3. **Logs not appearing in Loki**
   - Verify Loki is running and accessible
   - Check Promtail configuration
   - Verify log file permissions
