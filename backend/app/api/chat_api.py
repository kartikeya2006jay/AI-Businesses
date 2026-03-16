from fastapi import APIRouter
from datetime import datetime
import re

from app.utils.data_loader import load_transactions
from app.services.openai_service import ask_ai
from app.services.chat_history_service import get_history, add_message

router = APIRouter()


def extract_date(question: str):
    """Extract date like '14 march 2026' or '14th march 2026'."""

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
def chat(session_id: str, question: str):

    df = load_transactions()

    query_date = extract_date(question)

    # If question contains a specific date
    if query_date:

        df["date"] = df["date"].dt.date

        filtered = df[df["date"] == query_date]

        if filtered.empty:
            response = f"No sales were recorded on {query_date}."
        else:

            total_sales = filtered["amount"].sum()

            products = filtered["product"].tolist()

            response = (
                f"Sales on {query_date}:\n"
                f"Total revenue: ₹{total_sales}\n"
                f"Products sold: {', '.join(products)}"
            )

        return {
            "session_id": session_id,
            "response": response
        }

    # Otherwise send question to AI
    history = get_history(session_id)

    add_message(session_id, "user", question)

    ai_response = ask_ai(question, df)

    add_message(session_id, "assistant", ai_response)

    return {
        "session_id": session_id,
        "response": ai_response
    }