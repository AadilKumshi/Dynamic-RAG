import os
import shutil
import joblib
import json  
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config.config import settings

TEMP_DATA_DIR = "temp_rag_data"

def ingest_pdf(file_path: str, assistant_id: str, chunk_size: int, chunk_overlap: int):
    
    # Output Directory
    output_dir = os.path.join(TEMP_DATA_DIR, str(assistant_id))
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)

    # Analysis Started
    yield json.dumps({"status": "starting", "message": "Analyzing PDF Structure..."})

    # Load PDF
    print(f"--- Loading PDF: {file_path} ---")
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    
    cleaned_pages = []
    for page in pages:
        if page.page_content and page.page_content.strip():
            cleaned_pages.append(page)
    
    if not cleaned_pages:
        raise ValueError("No text found in PDF. Is it a scanned image?")
        
    print(f"Original Pages: {len(pages)} -> Cleaned Pages: {len(cleaned_pages)}")

    # Split Text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap, 
        length_function=len, 
        is_separator_regex=False
    )
    chunks = text_splitter.split_documents(cleaned_pages)

    chunks_content = []
    chunks_metadata = []
    for chunk in chunks:
        if chunk.page_content and chunk.page_content.strip():
            chunks_content.append(chunk.page_content)
            chunks_metadata.append(chunk.metadata)

    if not chunks_content:
        raise ValueError("PDF was empty after splitting/filtering!")

    total_chunks = len(chunks_content)
    print(f"Total Chunks to Embed: {total_chunks}")

    # 4. Setup Google Embeddings
    embedding_model = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.GOOGLE_API_KEY,
        task_type="retrieval_document" 
    )

    batch_size = 100
    vector_store = None
    
    print("--- Starting Batch Embedding with Heartbeat ---")
    
    for i in range(0, total_chunks, batch_size):
        batch_texts = chunks_content[i : i + batch_size]
        batch_metas = chunks_metadata[i : i + batch_size]
        
        # Calculate Progress
        current_progress = min(i + batch_size, total_chunks)
        percent = int((current_progress / total_chunks) * 100)
        
        yield json.dumps({
            "status": "processing", 
            "message": f"Embedding chunks...",
            "progress": percent
        })
        
        if vector_store is None:
            vector_store = FAISS.from_texts(
                texts=batch_texts, 
                embedding=embedding_model, 
                metadatas=batch_metas
            )
        else:
            vector_store.add_texts(texts=batch_texts, metadatas=batch_metas)

    vector_store.save_local(os.path.join(output_dir, "faiss_index"))
    joblib.dump(chunks_content, os.path.join(output_dir, "chunks.jil"))
    joblib.dump(chunks_metadata, os.path.join(output_dir, "metadata.jil"))

    print(f"--- Ingestion Complete for Assistant {assistant_id} ---")

    yield json.dumps({
        "status": "ingestion_complete", 
        "output_dir": output_dir
    })