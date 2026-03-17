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
    
    df = load_transactions()
    df["date"] = pd.to_datetime(df["date"]).dt.date
    # ... (rest of the chat logic)

    q = question.lower()

    # ---------- REVENUE SUMMARIES ----------
    if "how much" in q or "revenue" in q or "sales" in q:
        from app.api.transactions_api import get_summaries
        summaries = get_summaries()
        
        if "today" in q or "daily" in q:
            response = f"Your revenue today is ₹{summaries['daily']}."
        elif "week" in q:
            response = f"Your revenue this week is ₹{summaries['weekly']}."
        elif "month" in q:
            response = f"Your revenue this month is ₹{summaries['monthly']}."
        else:
            response = f"Your current summaries are: Daily: ₹{summaries['daily']}, Weekly: ₹{summaries['weekly']}, Monthly: ₹{summaries['monthly']}."
        
        return {"session_id": session_id, "response": response}

    # ---------- SPECIFIC DATE ----------
    query_date = extract_specific_date(question)
    if query_date:
        filtered = df[df["date"] == query_date]
        if filtered.empty:
            response = f"No sales recorded on {query_date}."
        else:
            total = filtered["amount"].sum()
            products = ", ".join(filtered["product"].astype(str).tolist())
            response = f"Sales on {query_date}: ₹{total}. Products sold: {products}"
        return {"session_id": session_id, "response": response}

    # ---------- OTHERWISE USE AI ----------
    history = get_history(session_id)
    add_message(session_id, "user", question)
    ai_response = ask_ai(question, df)
    add_message(session_id, "assistant", ai_response)

    return {
        "session_id": session_id,
        "response": ai_response
    }