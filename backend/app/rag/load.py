import os
from azure.storage.blob import BlobServiceClient
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from app.config.config import settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

TEMP_DATA_DIR = "temp_rag_data"

def download_assistant_data(assistant_id: str):

    local_path = os.path.join(TEMP_DATA_DIR, assistant_id)

    if os.path.exists(os.path.join(local_path, "faiss_index")):
        return local_path

    print(f"--- Cache Miss: Downloading Assistant {assistant_id} from Azure ---")
    os.makedirs(local_path, exist_ok=True)
    
    try:
        blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER_NAME)
        
        blobs = container_client.list_blobs(name_starts_with=f"{assistant_id}/")
        
        for blob in blobs:
            relative_path = blob.name.replace(f"{assistant_id}/", "", 1)
            dest_file_path = os.path.join(local_path, relative_path)

            os.makedirs(os.path.dirname(dest_file_path), exist_ok=True)

            print(f"Downloading: {blob.name}")
            with open(dest_file_path, "wb") as file:
                data = container_client.download_blob(blob.name).readall()
                file.write(data)
                
        print(f"--- Download Complete for Assistant {assistant_id} ---")
        return local_path

    except Exception as e:
        print(f"Error downloading from Azure: {e}")
        raise e

def load_rag_engine(assistant_id: str):

    local_path = download_assistant_data(assistant_id)
    
    embedding_model = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001", 
        google_api_key=settings.GOOGLE_API_KEY,
        task_type="retrieval_query"
    )
    
    index_path = os.path.join(local_path, "faiss_index")
    print(f"Loading Index from: {index_path}")

    vector_store = FAISS.load_local(
        folder_path=index_path, 
        embeddings=embedding_model, 
        allow_dangerous_deserialization=True
    )
    
    return vector_store