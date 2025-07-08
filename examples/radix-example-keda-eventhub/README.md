# Azure Event Hub example

## Azure Docs
- [Azure Event Hubs Overview](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about)
- [Azure Event Hubs example for Python](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-python-get-started-send?tabs=passwordless%2Croles-azure-portal)
- [Add an access role for a service principal](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-python-get-started-send?tabs=passwordless%2Croles-azure-portal#azure-built-in-roles-for-azure-event-hubs)

## Development of the web-application
### Install dependencies
```shell
cd ./web-app/src
pip3 install -r requirements.txt
```

### Run the web-application
```shell
export EVENT_HUB_NAME=my-event-hub-namespace;
export EVENT_HUB_NAMESPACE=my-event-hub;
export AZURE_CLIENT_ID=my-azure-client-id
export AZURE_TENANT_ID=my-azure-tenant-id
export PYTHONUNBUFFERED=1

python3 app.py
```

### Run the sender
```shell
export EVENT_HUB_CONNECTION=Endpoint=sb://...\;EntityPath=my-event-hub;
export EVENT_HUB_NAMESPACE=my-event-hub-namespace;
export EVENT_HUB_NAME=my-event-hub;
export CONSUMER_GROUP=$Default;
export STORAGE_CONNECTION=DefaultEndpointsProtocol=https\;AccountName=...
export BLOB_CONTAINER=my-blob-container
export PYTHONUNBUFFERED=1

python3 event_sender.py
```

## Docker 
### Build and run the Docker image (using Workload identity)
```shell
docker build -t eventhub-app .
docker run -it \
 -e EVENT_HUB_NAMESPACE=my-event-hub-namespace \
 -e EVENT_HUB_NAME=my-event-hub \
 -e AZURE_CLIENT_ID=my-azure-client-id \
 -e AZURE_TENANT_ID=my-azure-tenant-id \
 -p 8008:8008 \
 eventhub-app
```

## Development of the consumer
### Install dependencies
```shell
cd ./event-hub-consumer/src
pip3 install -r requirements.txt
```

### Run the consumer
```shell
export EVENT_HUB_CONNECTION=Endpoint=sb://...\;EntityPath=my-event-hub;
export EVENT_HUB_NAMESPACE=my-event-hub-namespace;
export EVENT_HUB_NAME=my-event-hub;
export CONSUMER_GROUP=$Default;
export STORAGE_CONNECTION=DefaultEndpointsProtocol=https\;AccountName=...
export BLOB_CONTAINER=my-blob-container
export PYTHONUNBUFFERED=1

python3 event-hub-consumer.py
```
