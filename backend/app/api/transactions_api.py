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
        "amount": [transaction.amount]
    }
    
    new_df = pd.DataFrame(new_data)
    
    if os.path.exists(TRANSACTIONS_FILE):
        # Ensure the file ends with a newline before appending
        with open(TRANSACTIONS_FILE, 'r') as f:
            content = f.read()
            if content and not content.endswith('\n'):
                with open(TRANSACTIONS_FILE, 'a') as fa:
                    fa.write('\n')
        new_df.to_csv(TRANSACTIONS_FILE, mode='a', header=False, index=False)
    else:
        new_df.to_csv(TRANSACTIONS_FILE, index=False)
        
    return {"message": "Transaction recorded and inventory updated", "product": transaction.product, "remaining_stock": int(inventory_df.at[idx, 'quantity'])}

class InventoryItem(BaseModel):
    product: str
    price: float
    quantity: int

@router.post("/inventory")
def update_inventory(item: InventoryItem):
    if not os.path.exists(INVENTORY_FILE):
        df = pd.DataFrame(columns=["product", "price", "quantity"])
    else:
        df = pd.read_csv(INVENTORY_FILE)
    
    if item.product in df["product"].values:
        idx = df[df["product"] == item.product].index[0]
        df.at[idx, "price"] = item.price
        df.at[idx, "quantity"] = item.quantity
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
    # Return last 20 transactions
    return df.tail(20).to_dict(orient="records")

@router.get("/summaries")
def get_summaries():
    if not os.path.exists(TRANSACTIONS_FILE):
        return {"daily": 0, "weekly": 0, "monthly": 0}
    
    df = pd.read_csv(TRANSACTIONS_FILE)
    df['date'] = pd.to_datetime(df['date'])
    today = datetime.now().date()
    
    # Daily
    daily_revenue = df[df['date'].dt.date == today]['amount'].sum()
    
    # Weekly
    start_of_week = today - pd.Timedelta(days=today.weekday())
    weekly_revenue = df[df['date'].dt.date >= start_of_week]['amount'].sum()
    
    # Monthly
    start_of_month = today.replace(day=1)
    monthly_revenue = df[df['date'].dt.date >= start_of_month]['amount'].sum()
    
    return {
        "daily": float(daily_revenue),
        "weekly": float(weekly_revenue),
        "monthly": float(monthly_revenue)
    }

@router.get("/inventory")
def get_inventory():
    if not os.path.exists(INVENTORY_FILE):
        return []
    df = pd.read_csv(INVENTORY_FILE)
    return df.to_dict(orient="records")
