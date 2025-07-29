# Medical Records Service

This microservice manages secure storage and retrieval of patient medical records as part of the Healthcare Appointment System.

## Features
- CRUD API for medical records
- FastAPI framework (Python)
- Prometheus metrics at `/metrics`
- Centralized JSON logging (Loki/ELK compatible)
- OpenTelemetry tracing
- Health check at `/health`
- Dockerized for deployment

## Requirements
- Python 3.11+
- Docker (optional)

## Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the service:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Monitoring & Logging
- Prometheus metrics: `/metrics`
- Logs: JSON format, suitable for Loki/ELK
- Tracing: OpenTelemetry OTLP exporter (configure endpoint as needed)

## Docker
Build and run with Docker:
```bash
docker build -t medical-records-service .
docker run -p 8000:8000 medical-records-service
```

## Endpoints
- `GET /health` — Health check
- `GET /api/v1/records` — List records
- `POST /api/v1/records` — Create record
- `GET /api/v1/records/{record_id}` — Get record
- `PUT /api/v1/records/{record_id}` — Update record
- `DELETE /api/v1/records/{record_id}` — Delete record

## Environment Variables
- `LOG_LEVEL` — Logging level (default: info)
- `METRICS_ENABLED` — Enable Prometheus metrics (default: true)
- `METRICS_PATH` — Path for metrics endpoint (default: /metrics)

## License
MIT
