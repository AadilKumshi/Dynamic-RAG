import json
import os
import shutil
import fitz  # PyMuPDF
import base64
from fastapi.responses import StreamingResponse
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import models, database, schemas
from app.security import Oauth2
from app.database.database import get_db
from app.rag.ingest import ingest_pdf
from app.rag.storage import upload_assistant_data, delete_assistant_data

router = APIRouter(
    prefix="/assistants",
    tags=["Assistants"]
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def ingest_stream_generator(file_path: str, assistant_id: str, chunk_size: int, chunk_overlap: int):
    output_dir = None
    
    try:
        iterator = ingest_pdf(
            file_path=file_path,
            assistant_id=assistant_id,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

        for message_json in iterator:
            message_data = json.loads(message_json)
            
            # Optional: Keep logging for debug
            # print(f" [STREAM] {message_data.get('message')}")

            if message_data.get("status") == "ingestion_complete":
                output_dir = message_data.get("output_dir")
            else:
                yield message_json + "\n"

        # Cleanup and finalize
        if output_dir:
            upload_assistant_data(output_dir, assistant_id)
            
            shutil.rmtree(output_dir)
            if os.path.exists(file_path):
                os.remove(file_path)
                
            final_msg = "Assistant Ready!"
            # print(f" [STREAM] {final_msg}")

            yield json.dumps({
                "status": "complete", 
                "message": "Assistant Ready!", 
                "assistant_id": assistant_id
            }) + "\n"
        else:
            print(" [STREAM ERROR] Ingestion failed to return output.")
            yield json.dumps({"status": "error", "message": "Ingestion failed to produce output."}) + "\n"

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f" [STREAM ERROR] {str(e)}")
        yield json.dumps({"status": "error", "message": str(e)}) + "\n"


@router.post("/") 
def create_assistant_stream(
    name: str = Form(...),
    temperature: float = Form(0.5),
    top_k: int = Form(5),
    chunk_size: int = Form(500),
    chunk_overlap: int = Form(50),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(Oauth2.get_current_user)
):
    # 1. Check Limit
    assistant_count = db.query(models.Assistant).filter(models.Assistant.owner_id == current_user.id).count()
    if assistant_count >= 3:
        raise HTTPException(status_code=403, detail="Limit reached: You can only create 3 assistants.")

    # 2. Validate
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # 3. Save PDF locally
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Generate Thumbnail (Base64)
    encoded_image = None
    try:
        doc = fitz.open(file_location)
        if len(doc) > 0:
            page = doc.load_page(0) # Get 1st page
            # Scale down to 30% size to save DB space
            pix = page.get_pixmap(matrix=fitz.Matrix(0.3, 0.3)) 
            image_bytes = pix.tobytes("png")
            encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        doc.close()
    except Exception as e:
        print(f"Thumbnail generation failed: {e}")

    # 5. Create DB Entry with Image
    new_assistant = models.Assistant(
        name=name,
        file_name=file.filename,
        owner_id=current_user.id,
        temperature=temperature,
        top_k=top_k,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        image_base64=encoded_image # <--- Save the image string here
    )
    db.add(new_assistant)
    db.commit()
    db.refresh(new_assistant)

    # 6. Return the Stream
    return StreamingResponse(
        ingest_stream_generator(
            file_path=file_location, 
            assistant_id=str(new_assistant.id), 
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        ),
        media_type="application/x-ndjson"
    )

# Use the schema from app/schemas.py
@router.get("/", response_model=List[schemas.AssistantResponse])
def get_my_assistants(db: Session = Depends(get_db), current_user: models.User = Depends(Oauth2.get_current_user)):
    assistants = db.query(models.Assistant).filter(models.Assistant.owner_id == current_user.id).all()
    return assistants


@router.delete("/{assistant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assistant(assistant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(Oauth2.get_current_user)):
    assistant_query = db.query(models.Assistant).filter(models.Assistant.id == assistant_id)
    assistant = assistant_query.first()

    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found")
    
    is_admin = getattr(current_user, "is_admin", False) 
    
    if assistant.owner_id != current_user.id and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this assistant")

    delete_assistant_data(str(assistant_id))

    # Clean up any local temp files
    local_path = os.path.join("temp_rag_data", str(assistant_id))
    if os.path.exists(local_path):
        shutil.rmtree(local_path)

    assistant_query.delete(synchronize_session=False)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)