#!/usr/bin/env bash
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Checking tesseract installation..."
which tesseract || echo "WARNING: tesseract not in PATH"
tesseract --version || echo "WARNING: tesseract executable not working"

echo "Running migrations..."
python manage.py migrate

echo "Build completed successfully!"