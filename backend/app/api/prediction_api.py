from fastapi import APIRouter
from app.utils.data_loader import load_data

router = APIRouter()

@router.get("/predict")
def predict():

    df = load_data()

    total_sales = df["amount"].sum()

    prediction = total_sales * 1.1

    return {
        "predicted_sales": round(prediction, 2)
    }