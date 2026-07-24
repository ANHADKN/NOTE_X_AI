#!/bin/bash
set -e

echo "=== Initializing noteX AI Production Runtime ==="

# Create runtime directories if missing
mkdir -p uploads chroma_db logs ml_models

# Start Gunicorn WSGI Server
echo "Starting Gunicorn WSGI server on port 5000..."
exec gunicorn -c gunicorn.conf.py "app:create_app()"
