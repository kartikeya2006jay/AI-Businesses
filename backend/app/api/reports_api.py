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
    if os.path.exists(TRANSACTIONS_FILE):
        tdf = pd.read_csv(TRANSACTIONS_FILE)
        tdf['date'] = pd.to_datetime(tdf['date'])
        month_sales = tdf[tdf['date'].dt.date >= start_of_month]
        total_sales = month_sales['amount'].sum()

    # 2. Calculate Total Expenses
    total_expenses = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        edf['date'] = pd.to_datetime(edf['date'])
        month_expenses = edf[edf['date'].dt.date >= start_of_month]
        total_expenses = month_expenses['amount'].sum()
    
    # 3. Simple Net Profit Calculation
    # Note: In a real app, we'd subtract Cost of Goods Sold (COGS)
    # For now, we'll estimate COGS as 70% of sales if we don't have purchase prices
    estimated_cogs = total_sales * 0.7
    net_profit = total_sales - estimated_cogs - total_expenses
    
    return {
        "period": "This Month",
        "revenue": float(total_sales),
        "expenses": float(total_expenses),
        "estimated_cogs": float(estimated_cogs),
        "net_profit": float(net_profit),
        "margin": float((net_profit / total_sales) * 100) if total_sales > 0 else 0
    }

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
