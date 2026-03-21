from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import os

router = APIRouter()

EXPENSES_FILE = "data/expenses.csv"

class Expense(BaseModel):
    category: str  # Rent, Salary, Electricity, Inventory, Misc
    amount: float
    description: str = ""
    date: str = None  # Optional, defaults to today

@router.post("/expenses")
def add_expense(expense: Expense):
    date_str = expense.date if expense.date else datetime.now().strftime("%Y-%m-%d")
    
    new_row = [date_str, expense.category, expense.amount, expense.description]
    
    file_exists = os.path.exists(EXPENSES_FILE)
    is_empty = file_exists and os.stat(EXPENSES_FILE).st_size == 0
    
    if not file_exists or is_empty:
        df = pd.DataFrame([new_row], columns=["date", "category", "amount", "description"])
        df.to_csv(EXPENSES_FILE, index=False)
    else:
        with open(EXPENSES_FILE, 'a') as f:
            pd.DataFrame([new_row]).to_csv(f, header=False, index=False)
            
    return {"status": "success", "amount": expense.amount}

@router.get("/expenses")
def get_expenses():
    if not os.path.exists(EXPENSES_FILE):
        return []
    df = pd.read_csv(EXPENSES_FILE)
    return df.to_dict(orient="records")
