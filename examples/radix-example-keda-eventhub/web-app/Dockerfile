FROM python:3.10-slim

WORKDIR /app

COPY src /app

ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8008
USER 1000

CMD ["python", "app.py"]