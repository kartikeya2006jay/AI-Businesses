from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import re
import pandas as pd

from app.utils.data_loader import load_transactions
from app.services.openai_service import ask_ai
from app.services.chat_history_service import get_history, add_message

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    question: str
    language: str = 'en-US'

def extract_specific_date(question: str):
# ... (same)
    pass

@router.post("/chat")
def chat(request: ChatRequest):
    session_id = request.session_id
    question = request.question
    language = request.language
    
    from app.utils.data_loader import load_transactions, load_inventory, load_lending
    df_trans = load_transactions()
    df_inv = load_inventory()
    df_lend = load_lending()
    
    # Ensure dates are correct
    df_trans["date"] = pd.to_datetime(df_trans["date"]).dt.date

    # ---------- USE AI FOR EVERYTHING ----------
    history = get_history(session_id)
    add_message(session_id, "user", question)
    
    # Pass all context pieces to ask_ai
    ai_response = ask_ai(question, df_trans, df_inv, lending_df=df_lend, language=language)
    
    add_message(session_id, "assistant", ai_response)

    return {
        "session_id": session_id,
        "response": ai_response
    }