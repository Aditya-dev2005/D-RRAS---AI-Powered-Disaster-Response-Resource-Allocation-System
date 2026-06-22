FROM python:3.11-slim

WORKDIR /app

# psycopg2-binary needs libpq at runtime; this keeps the image small while
# still letting psycopg2 connect to Postgres.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Uses $PORT if the platform injects one (Railway, Render, Fly.io all do this),
# otherwise falls back to 8000 for local/docker-compose use.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
