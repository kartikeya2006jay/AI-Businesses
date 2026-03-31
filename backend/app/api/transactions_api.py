from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import os

router = APIRouter()

TRANSACTIONS_FILE = "data/transactions.csv"
INVENTORY_FILE = "data/inventory.csv"

class Transaction(BaseModel):
    product: str
    amount: float
    quantity: int = 1
    customer_name: str = "Anonymous"
    is_credit: bool = False

@router.post("/transactions")
def add_transaction(transaction: Transaction):
    # 1. Deduct from inventory
    if not os.path.exists(INVENTORY_FILE):
        raise HTTPException(status_code=500, detail="Inventory file not found")
    
    inventory_df = pd.read_csv(INVENTORY_FILE)
    
    if transaction.product not in inventory_df['product'].values:
        raise HTTPException(status_code=400, detail=f"Product '{transaction.product}' not in inventory")
    
    idx = inventory_df[inventory_df['product'] == transaction.product].index[0]
    current_qty = inventory_df.at[idx, 'quantity']
    
    if current_qty < transaction.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    inventory_df.at[idx, 'quantity'] = current_qty - transaction.quantity
    inventory_df.to_csv(INVENTORY_FILE, index=False)
    
    # 2. Record transaction
    new_data = {
        "date": [datetime.now().strftime("%Y-%m-%d")],
        "product": [transaction.product],
        "amount": [transaction.amount],
        "customer_name": [transaction.customer_name],
        "is_credit": [transaction.is_credit]
    }
    
    new_df = pd.DataFrame(new_data)
    
    # 3. Handle Lending (Khata) if it's a credit sale
    if transaction.is_credit:
        LENDING_FILE = "data/lending.csv"
        if not os.path.exists(LENDING_FILE):
            ldf = pd.DataFrame(columns=["customer_name", "balance", "last_transaction"])
        else:
            ldf = pd.read_csv(LENDING_FILE)
        
        if transaction.customer_name in ldf['customer_name'].values:
            lidx = ldf[ldf['customer_name'] == transaction.customer_name].index[0]
            ldf.at[lidx, 'balance'] += transaction.amount
            ldf.at[lidx, 'last_transaction'] = datetime.now().strftime("%Y-%m-%d")
        else:
            new_l_row = pd.DataFrame([{
                "customer_name": transaction.customer_name,
                "balance": transaction.amount,
                "last_transaction": datetime.now().strftime("%Y-%m-%d")
            }])
            ldf = pd.concat([ldf, new_l_row], ignore_index=True)
        ldf.to_csv(LENDING_FILE, index=False)

    if os.path.exists(TRANSACTIONS_FILE):
        # Check if header matches (migration for existing files)
        check_df = pd.read_csv(TRANSACTIONS_FILE, nrows=0)
        if "customer_name" not in check_df.columns:
            # File exists but old format - need to update it or just create new
            main_df = pd.read_csv(TRANSACTIONS_FILE)
            main_df["customer_name"] = "Legacy User"
            main_df["is_credit"] = False
            main_df = pd.concat([main_df, new_df], ignore_index=True)
            main_df.to_csv(TRANSACTIONS_FILE, index=False)
        else:
            with open(TRANSACTIONS_FILE, 'a') as f:
                new_df.to_csv(f, header=False, index=False)
    else:
        new_df.to_csv(TRANSACTIONS_FILE, index=False)
        
    return {"message": "Transaction recorded", "product": transaction.product}

class InventoryItem(BaseModel):
    product: str
    price: float
    quantity: int
    cost_price: float = 0.0

@router.post("/inventory")
def update_inventory(item: InventoryItem):
    if not os.path.exists(INVENTORY_FILE):
        df = pd.DataFrame(columns=["product", "price", "quantity", "cost_price"])
    else:
        df = pd.read_csv(INVENTORY_FILE)
        if "cost_price" not in df.columns:
            df["cost_price"] = df["price"] * 0.7  # Initial migration
    
    if item.product in df["product"].values:
        idx = df[df["product"] == item.product].index[0]
        df.at[idx, "price"] = item.price
        df.at[idx, "quantity"] = item.quantity
        df.at[idx, "cost_price"] = item.cost_price
    else:
        new_row = pd.DataFrame([item.dict()])
        df = pd.concat([df, new_row], ignore_index=True)
    
    df.to_csv(INVENTORY_FILE, index=False)
    return {"message": "Inventory updated", "product": item.product}

@router.delete("/inventory/{product_name}")
def delete_inventory(product_name: str):
    if not os.path.exists(INVENTORY_FILE):
        raise HTTPException(status_code=404, detail="Inventory file not found")
    
    df = pd.read_csv(INVENTORY_FILE)
    if product_name not in df["product"].values:
        raise HTTPException(status_code=404, detail="Product not found")
    
    df = df[df["product"] != product_name]
    df.to_csv(INVENTORY_FILE, index=False)
    return {"message": "Product removed", "product": product_name}

@router.get("/transactions-history")
def get_transactions():
    if not os.path.exists(TRANSACTIONS_FILE):
        return []
    df = pd.read_csv(TRANSACTIONS_FILE)
    # Return last 100 transactions to give enough data for the chart's 30-day view
    return df.tail(100).to_dict(orient="records")

@router.get("/summaries")
def get_summaries():
    if not os.path.exists(TRANSACTIONS_FILE):
        return {
            "daily": 0, "prev_daily": 0,
            "weekly": 0, "prev_weekly": 0,
            "monthly": 0, "prev_monthly": 0
        }
    
    df = pd.read_csv(TRANSACTIONS_FILE)
    df['date'] = pd.to_datetime(df['date'])
    today = datetime.now().date()
    
    # helper for range sums
    def get_sum(start, end):
        return df[(df['date'].dt.date >= start) & (df['date'].dt.date <= end)]['amount'].sum()

    # Current periods
    daily = get_sum(today, today)
    
    start_of_week = today - pd.Timedelta(days=today.weekday())
    weekly = get_sum(start_of_week, today)
    
    start_of_month = today.replace(day=1)
    monthly = get_sum(start_of_month, today)
    
    # Previous periods
    prev_day = today - pd.Timedelta(days=1)
    prev_daily = get_sum(prev_day, prev_day)
    
    prev_week_start = start_of_week - pd.Timedelta(days=7)
    prev_week_end = start_of_week - pd.Timedelta(days=1)
    prev_weekly = get_sum(prev_week_start, prev_week_end)
    
    last_month_end = start_of_month - pd.Timedelta(days=1)
    prev_month_start = last_month_end.replace(day=1)
    prev_monthly = get_sum(prev_month_start, last_month_end)
    
    return {
        "daily": float(daily),
        "prev_daily": float(prev_daily),
        "weekly": float(weekly),
        "prev_weekly": float(prev_weekly),
        "monthly": float(monthly),
        "prev_monthly": float(prev_monthly)
    }

@router.get("/inventory")
def get_inventory():
    if not os.path.exists(INVENTORY_FILE):
        return []
    df = pd.read_csv(INVENTORY_FILE)
    return df.to_dict(orient="records")
