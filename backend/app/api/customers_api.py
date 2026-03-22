from fastapi import APIRouter
from app.utils.data_loader import load_transactions
import pandas as pd

router = APIRouter()


@router.get("/customers/analytics")
def get_customer_analytics():
    """Aggregate transaction data by customer to provide loyalty insights."""
    df = load_transactions()

    if df.empty or "customer_name" not in df.columns:
        return {"customers": [], "total_unique": 0}

    # Filter out legacy/anonymous
    named = df[~df["customer_name"].isin(["Legacy User", "Anonymous", ""])]

    if named.empty:
        return {"customers": [], "total_unique": 0}

    grouped = named.groupby("customer_name").agg(
        total_spend=("amount", "sum"),
        transaction_count=("amount", "count"),
        avg_order_value=("amount", "mean"),
        last_purchase=("date", "max"),
    ).reset_index()

    grouped["avg_order_value"] = grouped["avg_order_value"].round(2)
    grouped["total_spend"] = grouped["total_spend"].round(2)
    grouped = grouped.sort_values("total_spend", ascending=False)

    # Assign loyalty tier
    def get_tier(spend):
        if spend >= 1000:
            return "Gold"
        elif spend >= 500:
            return "Silver"
        return "Bronze"

    grouped["tier"] = grouped["total_spend"].apply(get_tier)
    grouped["last_purchase"] = grouped["last_purchase"].astype(str).str[:10]

    customers = grouped.to_dict(orient="records")
    return {"customers": customers, "total_unique": len(customers)}
