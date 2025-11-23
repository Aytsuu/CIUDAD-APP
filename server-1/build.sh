#!/usr/bin/env bash
set -o errexit

# Set environment variable to ensure non-interactive installation
export DEBIAN_FRONTEND=noninteractive

echo "Installing system dependencies..."
# Update package lists
apt-get update
# Install Tesseract, English language pack, and development libraries
apt-get install -y tesseract-ocr tesseract-ocr-eng libtesseract-dev

echo "Verifying Tesseract installation..."
# Check if the executable is available in the PATH
which tesseract || { echo "Tesseract not found. Build failure."; exit 1; }
tesseract --version || { echo "Tesseract executable failed to run. Build failure."; exit 1; }

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running migrations..."
python manage.py migrate

echo "Build completed successfully!"