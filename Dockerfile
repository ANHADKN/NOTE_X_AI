# Dockerfile for noteX AI Production Deployment
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

# Set working directory
WORKDIR /app

# Install system dependencies (build-essential, libmagic, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Create required runtime directories
RUN mkdir -p uploads chroma_db logs ml_models

# Expose port
EXPOSE 5000

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Run entrypoint script
ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
