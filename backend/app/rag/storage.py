import os
from azure.storage.blob import BlobServiceClient
from app.config.config import settings

def upload_assistant_data(local_dir: str, assistant_id: str):

    try:
        # Connect to Azure
        blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER_NAME)

        print(f"--- Starting Upload for Assistant {assistant_id} ---")
        
        for root, dirs, files in os.walk(local_dir):
            for file in files:
               
                local_file_path = os.path.join(root, file)
                
                relative_path = os.path.relpath(local_file_path, local_dir)
                blob_name = f"{assistant_id}/{relative_path}"
                
                
                print(f"Uploading: {blob_name}")
                with open(local_file_path, "rb") as data:
                    container_client.upload_blob(name=blob_name, data=data, overwrite=True)

        print("--- Upload Complete ---")
        return True

    except Exception as e:
        print(f"Error uploading to Azure: {e}")
        raise e
    

def delete_assistant_data(assistant_id: str):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER_NAME)
        
        blobs = container_client.list_blobs(name_starts_with=f"{assistant_id}/")
        
        for blob in blobs:
            print(f"Deleting blob: {blob.name}")
            container_client.delete_blob(blob.name)
            
        print(f"--- Deleted all cloud data for Assistant {assistant_id} ---")
        return True

    except Exception as e:
        print(f"Error deleting from Azure: {e}")
        return False