import os
import sys
from datetime import datetime, timedelta
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

# Robust .env loading
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), '.env')
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv("OPENAI_API_KEY")

def get_client():
    if not API_KEY:
        return None
    return OpenAI(api_key=API_KEY)

client = get_client()


# ---------- ANALYTICS FUNCTIONS ----------

def ensure_dates(df):
    """Ensure the date column is datetime."""
    if df["date"].dtype != "datetime64[ns]":
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df


def sales_yesterday(df):
    df = ensure_dates(df)

    yesterday = datetime.today().date() - timedelta(days=1)

    filtered = df[df["date"].dt.date == yesterday]

    total = float(filtered["amount"].sum())

    return {
        "metric": "sales_yesterday",
        "date": str(yesterday),
        "value": total
    }


def sales_this_week(df):
    df = ensure_dates(df)

    today = datetime.today().date()
    week_start = today - timedelta(days=7)

    filtered = df[df["date"].dt.date >= week_start]

    total = float(filtered["amount"].sum())

    return {
        "metric": "sales_last_7_days",
        "value": total
    }


def sales_this_month(df):
    df = ensure_dates(df)

    today = datetime.today().date()
    month_start = today.replace(day=1)

    filtered = df[df["date"].dt.date >= month_start]

    total = float(filtered["amount"].sum())

    return {
        "metric": "sales_this_month",
        "value": total
    }


def top_product(df):
    grouped = df.groupby("product")["amount"].sum()

    product = grouped.idxmax()
    revenue = float(grouped.max())

    return {
        "metric": "top_product",
        "product": product,
        "revenue": revenue
    }


# ---------- MAIN AI LOGIC ----------

def ask_ai(question: str, transactions_df: pd.DataFrame, inventory_df: pd.DataFrame = None):
    """Ultimate Merchant AI with full context awareness."""
    
    if not client:
        return "AI service is currently unavailable. Please check your API key in the .env file."

    # Prepare context strings
    inventory_context = "N/A"
    if inventory_df is not None:
        inventory_context = inventory_df.to_json(orient='records')

    # Quick summaries for the prompt
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # System Instruction
    system_prompt = (
        "You are the Paytm AI Merchant Copilot, a world-class business advisor and analyst. "
        "You have full access to the store's data provided below. "
        "Your goal is to help the merchant grow their business, manage inventory, and understand sales. "
        "Be professional, encouraging, and highly specific. "
        "\n\nBUSINESS DATA CONTEXT:\n"
        f"1. Current Date: {today}\n"
        f"2. Inventory Status: {inventory_context}\n"
        "3. Transactions (Last 10): " + transactions_df.tail(10).to_json(orient='records') + "\n"
        "\nSTRICT RULES:\n"
        "- If asked about stock, refer to 'Inventory Status'.\n"
        "- If asked about sales, refer to 'Transactions'.\n"
        "- If asked about GST or Tax, explain the 18% (9% CGST + 9% SGST) rule used in this app.\n"
        "- Also help with general merchant queries like 'how to increase sales' or coding help if it relates to the dashboard API."
        "- Keep responses concise but impactful."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Merchant AI is thinking... but ran into an error: {str(e)}"