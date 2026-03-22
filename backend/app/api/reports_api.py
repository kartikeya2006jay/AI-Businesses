from fastapi import APIRouter
from datetime import datetime, timedelta
import pandas as pd
import os

router = APIRouter()

TRANSACTIONS_FILE = "data/transactions.csv"
EXPENSES_FILE = "data/expenses.csv"
INVENTORY_FILE = "data/inventory.csv"

@router.get("/reports/profit-loss")
def get_profit_loss():
    today = datetime.now().date()
    start_of_month = today.replace(day=1)
    
    # 1. Calculate Total Sales (Revenue)
    total_sales = 0
    estimated_cogs = 0
    
    if os.path.exists(TRANSACTIONS_FILE):
        tdf = pd.read_csv(TRANSACTIONS_FILE)
        tdf['date'] = pd.to_datetime(tdf['date'])
        month_sales = tdf[tdf['date'].dt.date >= start_of_month]
        total_sales = month_sales['amount'].sum()
        
        # Try to calculate actual COGS if possible
        if os.path.exists(INVENTORY_FILE):
            idf = pd.read_csv(INVENTORY_FILE)
            costs = idf.set_index('product')['cost_price'].to_dict()
            # COGS = Sum of (transaction items * their cost)
            # Since transactions.csv currently only has total amount and product name, 
            # we assume quantity 1 for each line if quantity isn't tracked in transactions.
            # In a real app we'd have quantity per transaction.
            for _, row in month_sales.iterrows():
                product = row['product']
                cost = costs.get(product, row['amount'] * 0.7) # fallback
                estimated_cogs += cost
        else:
            estimated_cogs = total_sales * 0.7

    # 2. Calculate Total Expenses
    total_expenses = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        edf['date'] = pd.to_datetime(edf['date'])
        month_expenses = edf[edf['date'].dt.date >= start_of_month]
        total_expenses = month_expenses['amount'].sum()
    
    net_profit = total_sales - estimated_cogs - total_expenses
    
    return {
        "period": "This Month",
        "revenue": float(total_sales),
        "expenses": float(total_expenses),
        "estimated_cogs": float(estimated_cogs),
        "net_profit": float(net_profit),
        "margin": float((net_profit / total_sales) * 100) if total_sales > 0 else 0
    }

@router.get("/reports/margins")
def get_margins():
    if not os.path.exists(INVENTORY_FILE):
        return []
    
    df = pd.read_csv(INVENTORY_FILE)
    if 'cost_price' not in df.columns:
        df['cost_price'] = df['price'] * 0.7
        
    df['profit'] = df['price'] - df['cost_price']
    df['margin_pct'] = (df['profit'] / df['price']) * 100
    
    return df[['product', 'price', 'cost_price', 'profit', 'margin_pct']].to_dict(orient="records")

@router.get("/reports/eod")
def get_eod_summary():
    today = datetime.now().strftime("%Y-%m-%d")
    
    sales_today = 0
    credit_sales = 0
    cash_sales = 0
    
    if os.path.exists(TRANSACTIONS_FILE):
        df = pd.read_csv(TRANSACTIONS_FILE)
        today_df = df[df['date'] == today]
        sales_today = today_df['amount'].sum()
        credit_sales = today_df[today_df['is_credit'] == True]['amount'].sum()
        cash_sales = today_df[today_df['is_credit'] == False]['amount'].sum()

    expenses_today = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        expenses_today = edf[edf['date'] == today]['amount'].sum()
        
    return {
        "date": today,
        "total_sales": float(sales_today),
        "cash_sales": float(cash_sales),
        "credit_sales": float(credit_sales),
        "total_expenses": float(expenses_today),
        "net_cash_flow": float(cash_sales - expenses_today)
    }
@router.get("/reports/cash-drawer")
def get_cash_drawer():
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Calculate totals for today
    sales_today = 0
    credit_sales = 0
    cash_sales = 0
    
    if os.path.exists(TRANSACTIONS_FILE):
        df = pd.read_csv(TRANSACTIONS_FILE)
        today_df = df[df['date'] == today]
        sales_today = today_df['amount'].sum()
        credit_sales = today_df[today_df['is_credit'] == True]['amount'].sum()
        cash_sales = today_df[today_df['is_credit'] == False]['amount'].sum()

    expenses_today = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        expenses_today = edf[edf['date'] == today]['amount'].sum()

    # For a real app, opening_balance would be stored. Here we calculate it simply.
    opening_balance = 5000.0 # Standard starting cash
    closing_balance = opening_balance + cash_sales - expenses_today

    return {
        "date": today,
        "opening_balance": opening_balance,
        "cash_sales": float(cash_sales),
        "credit_sales": float(credit_sales),
        "expenses": float(expenses_today),
        "closing_balance": float(closing_balance)
    }
