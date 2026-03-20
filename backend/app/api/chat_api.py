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

def extract_specific_date(question: str):
    pattern = r'(\d{1,2})(st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})'
    match = re.search(pattern, question.lower())

    if match:
        day = match.group(1)
        month = match.group(3)
        year = match.group(4)

        try:
            return datetime.strptime(f"{day} {month} {year}", "%d %B %Y").date()
        except:
            return None

    return None

@router.post("/chat")
def chat(request: ChatRequest):
    session_id = request.session_id
    question = request.question
    
    from app.utils.data_loader import load_transactions, load_inventory
    df_trans = load_transactions()
    df_inv = load_inventory()
    
    # Ensure dates are correct
    df_trans["date"] = pd.to_datetime(df_trans["date"]).dt.date

    # ---------- USE AI FOR EVERYTHING ----------
    history = get_history(session_id)
    add_message(session_id, "user", question)
    
    # We pass session_id and history as well if we want context, 
    # but for now ask_ai handles the immediate question with full data.
    ai_response = ask_ai(question, df_trans, df_inv)
    
    add_message(session_id, "assistant", ai_response)

    return {
        "session_id": session_id,
        "response": ai_response
    }