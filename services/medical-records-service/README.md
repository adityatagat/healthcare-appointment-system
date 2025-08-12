# Medical Records Service

This microservice manages secure storage and retrieval of patient medical records as part of the Healthcare Appointment System.

## Features
- FHIR R4-compliant API for Observation, Condition, and Procedure resources
- Strict validation of all create/update requests for FHIR R4 compliance
- FastAPI framework (Python)
- Prometheus metrics at `/metrics`
- Centralized JSON logging (Loki/ELK compatible)
- OpenTelemetry tracing
- Health check at `/health`
- Dockerized for deployment

## Requirements
- Python 3.11+
- Docker (optional)
- MongoDB

## MongoDB Setup & Configuration

This service uses MongoDB for persistent storage of all FHIR resource types (Observation, Condition, Procedure).

### Environment Variables
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `MONGODB_DB`: Database name (default: `medical_records_db`)
- `LOG_LEVEL` — Logging level (default: info)
- `METRICS_ENABLED` — Enable Prometheus metrics (default: true)
- `METRICS_PATH` — Path for metrics endpoint (default: /metrics)

Set these in your environment or a `.env` file as needed.

### Seeding the Database
Run the seed script to populate MongoDB collections with FHIR R4-compliant sample data:

```bash
python app/seed_data.py
```

### Running the Service
1. Ensure MongoDB is running and accessible using the configured URI.
2. Start the FastAPI app:

```bash
uvicorn app.main:app --reload
```

3. Access API docs at [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

### Running Tests
Tests will seed and clean up MongoDB automatically:

```bash
pytest
```

### Troubleshooting
- If tests or the app cannot connect, ensure MongoDB is running at the URI in `MONGODB_URI`.
- For local development, the default URI assumes a local MongoDB instance.
- For CI or remote DBs, set `MONGODB_URI` and `MONGODB_DB` appropriately.

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
- `GET /api/v1/records` — List records (FHIR Observation[])
- `POST /api/v1/records` — Create record (FHIR Observation, strict validation)
- `GET /api/v1/records/{record_id}` — Get record (FHIR Observation)
- `PUT /api/v1/records/{record_id}` — Update record (FHIR Observation, strict validation)
- `DELETE /api/v1/records/{record_id}` — Delete record
- `GET /api/v1/conditions` — List conditions (FHIR Condition[])
- `POST /api/v1/conditions` — Create condition (FHIR Condition, strict validation)
- `GET /api/v1/conditions/{condition_id}` — Get condition (FHIR Condition)
- `PUT /api/v1/conditions/{condition_id}` — Update condition (FHIR Condition, strict validation)
- `DELETE /api/v1/conditions/{condition_id}` — Delete condition
- `GET /api/v1/procedures` — List procedures (FHIR Procedure[])
- `POST /api/v1/procedures` — Create procedure (FHIR Procedure, strict validation)
- `GET /api/v1/procedures/{procedure_id}` — Get procedure (FHIR Procedure)
- `PUT /api/v1/procedures/{procedure_id}` — Update procedure (FHIR Procedure, strict validation)
- `DELETE /api/v1/procedures/{procedure_id}` — Delete procedure

### FHIR R4 Validation
- All POST and PUT requests are validated against the FHIR R4 resource definition for their type (Observation, Condition, or Procedure).
- If the payload is not FHIR-compliant, the API returns HTTP 422 with details.

#### Example FHIR Observation Payload
```json
{
  "resourceType": "Observation",
  "id": "rec100",
  "identifier": [{"system": "http://hospital.org/medical-records", "value": "rec100"}],
  "status": "final",
  "code": {"text": "Blood Pressure Observation"},
  "subject": {"reference": "Patient/pat100", "display": "John Doe"},
  "effectiveDateTime": "2025-07-01T09:00:00+05:30",
  "performer": [{"reference": "Practitioner/prov100", "display": "Dr. Smith"}],
  "valueString": "Hypertension - Medication"
}
```

#### Example FHIR Condition Payload
```json
{
  "resourceType": "Condition",
  "id": "cond100",
  "code": {"text": "Diabetes Mellitus"},
  "subject": {"reference": "Patient/pat100", "display": "John Doe"},
  "clinicalStatus": {"text": "active"},
  "onsetDateTime": "2023-01-01T00:00:00+05:30"
}
```

#### Example FHIR Procedure Payload
```json
{
  "resourceType": "Procedure",
  "id": "proc100",
  "status": "completed",
  "code": {"text": "Appendectomy"},
  "subject": {"reference": "Patient/pat100", "display": "John Doe"},
  "performedDateTime": "2024-03-15T08:00:00+05:30",
  "performer": [{"reference": "Practitioner/prov100", "display": "Dr. Smith"}]
}
```

#### Example Error Response (Invalid FHIR)
```json
{
  "detail": "FHIR Condition validation failed: [{'loc': ['code'], 'msg': 'field required', 'type': 'missing'}]"
}
```

## Environment Variables
- `LOG_LEVEL` — Logging level (default: info)
- `METRICS_ENABLED` — Enable Prometheus metrics (default: true)
- `METRICS_PATH` — Path for metrics endpoint (default: /metrics)

## License
MIT
