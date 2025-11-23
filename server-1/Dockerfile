FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update
RUN apt-get install -y tesseract-ocr
RUN apt-get install -y tesseract-ocr-eng
RUN apt-get install -y libtesseract-dev
RUN apt-get install -y libgl1-mesa-glx || echo "libgl1-mesa-glx failed"
RUN apt-get install -y libglib2.0-0

RUN tesseract --version

RUN pip install --upgrade pip

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

CMD ["gunicorn", "backend.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:10000", "--timeout", "120", "--workers", "2"]