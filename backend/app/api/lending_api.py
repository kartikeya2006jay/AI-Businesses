from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import os
import json
from app.utils.logger import log_event

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
    old_balance = float(df.at[idx, 'balance'])
    df.at[idx, 'balance'] -= payment.amount_paid
    new_balance = float(df.at[idx, 'balance'])
    
    df.to_csv(LENDING_FILE, index=False)
    
    # Log Khata Settlement Event
    status_text = "Fully Settled" if new_balance <= 0 else f"Paid ₹{payment.amount_paid}"
    log_event("KHATA", "Balance Settlement", f"{payment.customer_name} {status_text}. Remaining: ₹{new_balance}")
    
    return {"status": "success", "new_balance": new_balance}
