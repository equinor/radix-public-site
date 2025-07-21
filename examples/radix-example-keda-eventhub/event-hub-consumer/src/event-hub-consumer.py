import asyncio
import time

from azure.eventhub import EventData
from azure.eventhub.aio import EventHubConsumerClient
from azure.eventhub.amqp import AmqpMessageBodyType
from azure.eventhub.extensions.checkpointstoreblobaio import BlobCheckpointStore
from environs import Env
from typing import (
    Union,
    Dict,
    Any,
    AnyStr,
    Iterable,
    Optional,
    List,
    TYPE_CHECKING,
    cast,
)

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

env = Env()
env.read_env()  # optional, loads .env file

EVENT_HUB_CONNECTION = env.str("EVENT_HUB_CONNECTION")
EVENT_HUB_NAME = env.str("EVENT_HUB_NAME")
STORAGE_CONNECTION = env.str("STORAGE_CONNECTION")
BLOB_CONTAINER = env.str("BLOB_CONTAINER")
CONSUMER_GROUP = env.str("CONSUMER_GROUP", default="$Default")
EVENT_HUB_LOG_LEVEL = env.str("EVENT_HUB_LOG_LEVEL", default="WARNING")
HTTP_POLICY_LOG_LEVEL = env.str("HTTP_POLICY_LOG_LEVEL", default="WARNING")
SLEEP_SECONDS = env.int("SLEEP_SECONDS", default=5)

logging.getLogger("azure.eventhub").setLevel(EVENT_HUB_LOG_LEVEL)
logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(HTTP_POLICY_LOG_LEVEL)

checkpoint_store = BlobCheckpointStore.from_connection_string(
    conn_str=STORAGE_CONNECTION,
    container_name=BLOB_CONTAINER,
)

client = EventHubConsumerClient.from_connection_string(
    conn_str=EVENT_HUB_CONNECTION,
    consumer_group=CONSUMER_GROUP,
    eventhub_name=EVENT_HUB_NAME,
    logging_enable=True,


    checkpoint_store=checkpoint_store,
)

def get_message_string(event, encoding: str = "UTF-8") -> str:
    """
    Returns the event message as a string, handling empty or non-decodable bodies gracefully.
    """
    data = event.body
    try:
        if event.body_type != AmqpMessageBodyType.DATA:
            return event._decode_non_data_body_as_str(encoding=encoding)
        return "".join(
            b.decode(encoding) for b in cast(Iterable[bytes], data) if b is not None
        )
    except (UnicodeDecodeError, TypeError, AttributeError):
        try:
            return str(data) if data is not None else ""
        except Exception as e:
            logging.error(f"Error converting message body to string: {e}")
            return ""

async def on_event(partition_context, event: EventData):
    # This function will be called when an event is received.
    # You can process the event here.
    # For example, you can print the event data.
    try:
        logging.info(f"Event:")
        logging.info(f"- partition: {partition_context.partition_id}")
        logging.info(f"- offset: {event.offset}")
        logging.info(f"- sequence number {event.sequence_number}")
        message = get_message_string(event)
        logging.info(f"- message: {message}")
        logging.info(f"Sleep {SLEEP_SECONDS} seconds...")
        time.sleep(SLEEP_SECONDS)  # Simulate some processing delay
        logging.info("WakeUp")
        await partition_context.update_checkpoint(event)
    except Exception as e:
        logging.error(f"Error updating checkpoint: {e}")


async def main():
    logging.info("Event consumer started")
    async with client:
        logging.info("Received an event...")
        try:
            await client.receive(on_event=on_event, starting_position="-1")
        except Exception as e:
            logging.error(f"Error receiving events: {e}")


if __name__ == "__main__":
    asyncio.run(main())
