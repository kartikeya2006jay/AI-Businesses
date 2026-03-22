from fastapi import APIRouter
from app.utils.data_loader import load_transactions
from datetime import datetime, timedelta
import pandas as pd

router = APIRouter()

@router.get("/customers/analytics")
def get_customer_analytics():
    """Aggregate transaction data for professional insights with a 10-day active window."""
    df = load_transactions()

    if df.empty or "customer_name" not in df.columns:
        return {"recent_customers": [], "stats": {"total_unique": 0, "monthly_revenue": 0}}

    # Filter out anonymous
    named = df[~df["customer_name"].isin(["Legacy User", "Anonymous", ""])]
    if named.empty:
        return {"recent_customers": [], "stats": {"total_unique": 0, "monthly_revenue": 0}}

    # Date handling
    named["date"] = pd.to_datetime(named["date"])
    now = datetime.now()
    month_ago = now - timedelta(days=30)
    ten_days_ago = (now - timedelta(days=10)).date()

    # 1. Total/Monthly Stats (Whole month)
    monthly_data = named[named["date"] >= month_ago]
    total_unique = monthly_data["customer_name"].nunique()
    monthly_revenue = monthly_data["amount"].sum()

    # 2. Recent Active Customers (Last 10 days only)
    recent_data = named[named["date"].dt.date >= ten_days_ago]
    
    if recent_data.empty:
        return {
            "recent_customers": [],
            "stats": {"total_unique": total_unique, "monthly_revenue": float(monthly_revenue)}
        }

    grouped = recent_data.groupby("customer_name").agg(
        total_spend=("amount", "sum"),
        transaction_count=("amount", "count"),
        avg_order_value=("amount", "mean"),
        last_purchase=("date", "max"),
    ).reset_index()

    grouped["last_purchase"] = grouped["last_purchase"].dt.strftime("%Y-%m-%d")
    grouped = grouped.sort_values("total_spend", ascending=False)
    
    customers = grouped.to_dict(orient="records")
    return {
        "recent_customers": customers,
        "stats": {
            "total_unique": total_unique,
            "monthly_revenue": float(monthly_revenue)
        }
    }
