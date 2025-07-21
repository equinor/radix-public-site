import os
import logging
from azure.eventhub import EventData
from azure.eventhub.aio import EventHubProducerClient
from azure.identity.aio import DefaultAzureCredential
import asyncio


eh_namespace = os.getenv('EVENT_HUB_NAMESPACE')
eh_name = os.getenv('EVENT_HUB_NAME')
clientId = os.getenv('AZURE_CLIENT_ID') # when used Workload Identity
tenantId = os.getenv('AZURE_TENANT_ID')

credential = DefaultAzureCredential()

async def run(data):
    logging.info(f"Using Event Hub namespace: {eh_namespace}, Event Hub Name: {eh_name}")
    logging.info(f"For ClientID: {clientId}, Tenant ID: {tenantId}")
    try:
        token = await credential.get_token("https://eventhubs.azure.net/.default")
        logging.info(f"Successfully retrieved token. Expires at: {token.expires_on}")
    except Exception as e:
        logging.error(f"Token retrieval failed: {e}")
        await credential.close()
        raise
    # Create a producer client to send messages to the event hub.
    # Specify a credential that has correct role assigned to access
    # event hubs namespace and the event hub name.
    producer = EventHubProducerClient(
        fully_qualified_namespace=(eh_namespace + ".servicebus.windows.net"),
        eventhub_name=eh_name,
        credential=credential,
    )
    logging.info("Producer client created successfully.")
    async with producer:
        # Create a batch.
        event_data_batch = await producer.create_batch()
        # Add events to the batch.
        event_data_batch.add(EventData("Event for " + data))
        # Send the batch of events to the event hub.
        await producer.send_batch(event_data_batch)
        # Close credential when no longer needed.
        await credential.close()

def send_event(data):
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run(data))

if __name__ == "__main__":
    send_event("Test event from main function")