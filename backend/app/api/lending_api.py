from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import os
import json

router = APIRouter()
LENDING_FILE = "data/lending.csv"

class LendingUpdate(BaseModel):
    customer_name: str
    amount_paid: float

@router.get("/lending")
async def get_lending():
    if not os.path.exists(LENDING_FILE):
        return []
    df = pd.read_csv(LENDING_FILE)
    return df.to_dict(orient="records")

@router.post("/lending/pay")
async def pay_lending(payment: LendingUpdate):
    if not os.path.exists(LENDING_FILE):
        raise HTTPException(status_code=404, detail="No lending records found")
    
    df = pd.read_csv(LENDING_FILE)
    if payment.customer_name not in df['customer_name'].values:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    idx = df[df['customer_name'] == payment.customer_name].index[0]
    df.at[idx, 'balance'] -= payment.amount_paid
    
    # If balance is 0 or less, maybe we keep it or remove it? Let's keep for history
    df.to_csv(LENDING_FILE, index=False)
    return {"status": "success", "new_balance": float(df.at[idx, 'balance'])}
