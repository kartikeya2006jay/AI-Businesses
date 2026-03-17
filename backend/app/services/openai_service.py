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

def ask_ai(question: str, df: pd.DataFrame):

    q = question.lower()

    try:
        if not client:
            return "AI service is currently unavailable. Please check your API key in the .env file."

        result = None

        if "yesterday" in q:
            result = sales_yesterday(df)
        elif "week" in q:
            result = sales_this_week(df)
        elif "month" in q:
            result = sales_this_month(df)
        elif "top product" in q or "best product" in q:
            result = top_product(df)

        if result:
            prompt = f"You are an AI merchant analytics assistant. Explain the following business result clearly: {result}. Respond with 'Insight:', 'Reason:', and 'Recommendation:'."
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You help merchants understand analytics."},
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.choices[0].message.content
            except Exception as e:
                return f"AI Insight temporarily unavailable. Low-level result: {result}. (Error: {str(e)})"

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a friendly AI assistant for merchants. Respond concisely and professionally."},
                    {"role": "user", "content": question}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            if "rate_limit" in str(e).lower():
                return "AI service is currently busy (rate limit exceeded). Please try again in internal or simplified mode."
            raise e

    except Exception as e:
        return f"Error processing request: {str(e)}"