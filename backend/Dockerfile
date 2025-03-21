# Build stage for dependencies
FROM python:3.10-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /install

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies in virtual environment
COPY requirements.txt .
RUN python -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/venv/bin:$PATH"

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder stage
COPY --from=builder /venv /venv

# Copy only the necessary directories and files
COPY manage.py .
COPY backend/ ./backend/
COPY adminpanel/ ./adminpanel/
COPY webapp/ ./webapp/
COPY utils/ ./utils/
COPY diagnosis/ ./diagnosis/
COPY mlmodel/ ./mlmodel/
COPY datasets/ ./datasets/

# Create and set permissions for media directory
RUN mkdir -p /app/static/media && \
    chmod -R 755 /app/static/media && \
    chown -R www-data:www-data /app/static/media

# Expose the port Django will use
EXPOSE 8000

# Command to run the application with Gunicorn
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]