# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl tini && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app ./app

# Expose port
EXPOSE 8000

# Set environment variables
ENV LOG_LEVEL=info
ENV METRICS_ENABLED=true
ENV METRICS_PATH=/metrics

# Use tini for signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]

# Run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
