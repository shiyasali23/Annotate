# Use a prebuilt PyTorch image with CUDA for GPU support
FROM pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime AS builder

WORKDIR /install

# Install system dependencies required for OpenCV and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment and upgrade pip
RUN python -m venv /venv && \
    /venv/bin/pip install --upgrade pip

# Copy only requirements to improve caching
COPY requirements.txt .

# Install dependencies separately for better caching
RUN /venv/bin/pip install --default-timeout=600 --no-cache-dir -r requirements.txt

# Use a slim base image for the final runtime container
FROM python:3.10-slim

WORKDIR /app

# Install runtime dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the prebuilt virtual environment from the builder stage
COPY --from=builder /venv /venv

# Set the environment variable to use the virtual environment
ENV PATH="/venv/bin:$PATH"

# Copy the application files
COPY main.py management.py responses.py ./
COPY model/ ./model/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
