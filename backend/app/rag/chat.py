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

    template = """
You are a friendly, expert Tutor. Your goal is to help the user understand the provided text by explaining it in simple, clear terms. Imagine you are explaining this to a smart student who is learning this for the first time.

INSTRUCTIONS
1.  **Strict Foundation:** Base your answer's *facts* ONLY on the "Context" provided below. Do not invent new information.
2.  **Simplify & Expand:** Do not just repeat the text. Rephrase complex sentences into plain English keeping the technical wordings where necessary. Expand on ideas to ensure clarity and understanding.
3.  **Mandatory Analogies:** If the user explicitly asks for a real-world analogy or example, you MUST provide one to help the user visualize it (e.g., "Think of this like...").
4.  **Honesty:** If the answer is not in the context, say: "The provided document doesn't contain the answer to this question."
5. **Answer Structure**: Start with a brief summary, followed by an explanation. Use bullet points or numbered lists for clarity where appropriate but keep it mix and match with paragraphs and keep your response concise.

CONTEXT
{context}

USER QUESTION
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