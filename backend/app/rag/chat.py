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
import re

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# Helper function to convert backticks to LaTeX math format
def convert_backticks_to_latex(text: str) -> str:
    """Convert backticks containing math-like expressions to LaTeX format"""
    def replace_backtick(match):
        inner = match.group(1)
        
        # Don't convert if it's clearly code (contains spaces without math operators)
        if ' ' in inner and not any(op in inner for op in ['=', '+', '-', '*', '/', '←', '→', '|']):
            return match.group(0)
        
        # Check if it looks like math:
        # 1. Contains math operators or symbols including pipes for norms
        # 2. Single letter
        # 3. Function notation like f(x), fw,b(x)
        # 4. Variable with subscripts/parameters like fw,b, x_i
        # 5. Short alphanumeric that looks like a variable
        is_math = bool(
            # Math operators and symbols including comma for subscripts and pipes for norms
            re.search(r'[=+\-*/()←→≤≥∈∑∫^_,|]', inner) or
            # Single letter
            re.match(r'^[a-zA-Z]$', inner) or
            # Function notation with parameters
            re.match(r'^[a-zA-Z][a-zA-Z0-9,_]*\([^)]*\)$', inner) or
            # Variable with comma/underscore (subscripts)
            re.match(r'^[a-zA-Z][a-zA-Z0-9,_*]*$', inner)
        )
        
        if is_math:
            # Fix subscripts: convert fw,b to f_{w,b}
            inner = re.sub(r'([a-zA-Z])([a-zA-Z0-9,]+)(\([^)]*\))?', lambda m: 
                f"{m.group(1)}_{{{m.group(2)}}}{m.group(3) if m.group(3) else ''}" 
                if ',' in m.group(2) or (len(m.group(2)) > 1 and not m.group(3))
                else m.group(0), inner)
            
            # Convert || to \| for LaTeX norms: ||w|| becomes \|w\|
            inner = inner.replace('||', '\\|')
            
            return f'${inner}$'
        
        return match.group(0)
    
    # Convert backticks to $ $ for math expressions
    text = re.sub(r'`([^`]+)`', replace_backtick, text)
    # Convert \( \) to $ $
    text = re.sub(r'\\\(([^)]+)\\\)', r' $\1$ ', text)
    # Convert \[ \] to $$ $$
    text = re.sub(r'\\\[([^\]]+)\\\]', r'\n\n$$\n\1\n$$\n\n', text, flags=re.DOTALL)
    
    return text

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
5.  **Professional Formatting:** 
    - Write in well-structured paragraphs for explanations and descriptions
    - Use bullet points ONLY when listing distinct items, features, or steps (3+ related items)
    - CRITICAL RULE: Inside bullet points, write in plain text WITHOUT any **bold** or __bold__ syntax.
      ❌ WRONG: "• **Feature Name:** explanation"
      ✅ CORRECT: "• Feature Name: explanation"
    - Use headers (##, ###) to organize different sections or concepts
    - Avoid excessive bullet nesting or bullet points for every single sentence
    - Mix paragraphs with occasional lists for better readability
    - Keep responses clear, concise, and visually balanced

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
    
    # Convert backticks to LaTeX format for proper math rendering
    response_text = convert_backticks_to_latex(response_text)

    sources = sorted(list(set([doc.metadata.get("page", 0) for doc in retrieved_docs])))

    return ChatResponse(response=response_text, sources=sources)