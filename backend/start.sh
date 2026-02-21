#!/bin/bash
# Install dependencies first
pip install -r requirements.txt

# Start the application
uvicorn hybrid_main:app --host 0.0.0.0 --port $PORT
