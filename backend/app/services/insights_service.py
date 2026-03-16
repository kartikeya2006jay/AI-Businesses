import pandas as pd
from app.utils.time_utils import get_today, get_yesterday

def generate_analytics(df):

    df["date"] = pd.to_datetime(df["date"]).dt.date

    yesterday = get_yesterday()

    yesterday_data = df[df["date"] == yesterday]

    if yesterday_data.empty:
        return "No transactions found for yesterday."

    total_revenue = yesterday_data["amount"].sum()

    product_sales = (
        yesterday_data
        .groupby("product")["amount"]
        .sum()
        .sort_values(ascending=False)
    )

    top_product = product_sales.idxmax()

    response = f"""
📊 Sales Analytics

Date analyzed: {yesterday}

Total Revenue: ₹{total_revenue}

Top Product: {top_product}

Product Breakdown:
"""

    for product, value in product_sales.items():
        response += f"{product} → ₹{value}\n"

    return response