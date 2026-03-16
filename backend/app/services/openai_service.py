import os
from datetime import datetime, timedelta
import pandas as pd

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("OPENAI_API_KEY not found in .env")

client = OpenAI(api_key=API_KEY)


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

        result = None

        if "yesterday" in q:
            result = sales_yesterday(df)

        elif "week" in q:
            result = sales_this_week(df)

        elif "month" in q:
            result = sales_this_month(df)

        elif "top product" in q or "best product" in q:
            result = top_product(df)

        # If analytics question
        if result:

            prompt = f"""
You are an AI merchant analytics assistant.

Explain the following business result clearly.

Data Result:
{result}

Respond with:

Insight:
Reason:
Recommendation:
"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You help merchants understand analytics."},
                    {"role": "user", "content": prompt}
                ]
            )

            return response.choices[0].message.content

        # Normal conversation
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a friendly AI assistant for merchants."},
                {"role": "user", "content": question}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error processing request: {str(e)}"