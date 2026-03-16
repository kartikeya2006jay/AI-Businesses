from fastapi import APIRouter
from app.utils.data_loader import load_data

router = APIRouter()

@router.get("/alerts")
def get_alerts():

    df = load_data()

    low_sales_products = df.groupby("product")["amount"].sum()

    alerts = []

    for product, value in low_sales_products.items():

        if value < 200:
            alerts.append(f"Low sales alert for {product}")

    return {
        "alerts": alerts
    }