FROM python:3.10-slim

WORKDIR /app

COPY ./src /app

ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir -r requirements.txt

# Optional: install uvloop for faster async (Linux only)
RUN pip install --no-cache-dir uvloop

USER 1000
CMD ["python","event-hub-consumer.py"]
