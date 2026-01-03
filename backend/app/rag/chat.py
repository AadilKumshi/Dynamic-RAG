from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

# LangChain & Gemini Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# App Imports
from app.database.database import get_db
from app.database import models
from app.security.Oauth2 import get_current_user
from app.rag.load import load_rag_engine
from app.config.config import settings

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# --- Pydantic Models for Request/Response ---
class ChatRequest(BaseModel):
    assistant_id: int
    query: str

class ChatResponse(BaseModel):
    response: str
    sources: List[int] = []

# --- The Chat Endpoint ---
@router.post("/", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    assistant = db.query(models.Assistant).filter(
        models.Assistant.id == request.assistant_id,
        models.Assistant.owner_id == current_user.id
    ).first()

    if not assistant:
        raise HTTPException(status_code=404, detail="Assistant not found or access denied")

    try:
        vector_store = load_rag_engine(str(assistant.id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load assistant data: {str(e)}")

    retriever = vector_store.as_retriever(search_kwargs={"k": assistant.top_k})

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=assistant.temperature,
        google_api_key=settings.GOOGLE_API_KEY,
        convert_system_message_to_human=True 
    )

    template = """You are a helpful AI assistant. 
    Answer the user's question based ONLY on the following context. 
    If the answer is not in the context, say "I don't know based on the provided document."
    
    Context:
    {context}
    
    Question: 
    {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    retrieved_docs = retriever.invoke(request.query)
    formatted_context = format_docs(retrieved_docs)

    chain = prompt | llm | StrOutputParser()
    response_text = chain.invoke({"context": formatted_context, "question": request.query})

    sources = sorted(list(set([doc.metadata.get("page", 0) for doc in retrieved_docs])))

    return ChatResponse(response=response_text, sources=sources)