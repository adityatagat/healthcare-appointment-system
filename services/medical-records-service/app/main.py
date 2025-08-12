from fastapi import FastAPI, Request
from prometheus_fastapi_instrumentator import Instrumentator
import logging
import uvicorn
from .routers import records
from .utils.logger import configure_logger

# --- OpenTelemetry Setup ---
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
import os

otel_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318/v1/traces")
resource = Resource.create({"service.name": "medical-records-service"})
tracer_provider = TracerProvider(resource=resource)

# Only initialize the OTLP exporter if not running under pytest
def is_pytest():
    return "PYTEST_CURRENT_TEST" in os.environ

if not is_pytest():
    otel_exporter = OTLPSpanExporter(endpoint=otel_endpoint)
    span_processor = BatchSpanProcessor(otel_exporter)
    tracer_provider.add_span_processor(span_processor)
    trace.set_tracer_provider(tracer_provider)

# --- End OpenTelemetry Setup ---

app = FastAPI(
    title="Medical Records Service",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/api-docs"
)

# Instrument FastAPI with OpenTelemetry
FastAPIInstrumentor.instrument_app(app)

# Configure logging
configure_logger()
logger = logging.getLogger("medical-records-service")

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/health", tags=["Health"])
def health():
    return {"status": "UP"}

# Include routers
from app.routers import conditions, procedures

def include_routers():
    app.include_router(records.router, prefix="/api/v1/records", tags=["Medical Records"])
    app.include_router(conditions.router, prefix="/api/v1/conditions", tags=["Conditions"])
    app.include_router(procedures.router, prefix="/api/v1/procedures", tags=["Procedures"])

include_routers()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
