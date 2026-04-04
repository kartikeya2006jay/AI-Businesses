from fastapi import APIRouter
from datetime import datetime, timedelta
import pandas as pd
import os
import json

router = APIRouter()

# --- NEW: Robust Path Handling ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "transactions.csv")
INVENTORY_FILE = os.path.join(DATA_DIR, "inventory.csv")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")
from app.utils.logger import log_event, NOTIFICATIONS_JSON

def get_data_path(filename):
    return os.path.join(DATA_DIR, filename)

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
    today_dt = datetime.now().date()
    
    sales_today = 0
    credit_sales = 0
    cash_sales = 0
    
    if os.path.exists(TRANSACTIONS_FILE):
        df = pd.read_csv(TRANSACTIONS_FILE)
        df['date_dt'] = pd.to_datetime(df['date']).dt.date
        today_df = df[df['date_dt'] == today_dt]
        sales_today = today_df['amount'].sum()
        credit_sales = today_df[today_df['is_credit'] == True]['amount'].sum()
        cash_sales = today_df[today_df['is_credit'] == False]['amount'].sum()

    expenses_today = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        edf['date_dt'] = pd.to_datetime(edf['date']).dt.date
        expenses_today = edf[edf['date_dt'] == today_dt]['amount'].sum()
        
    return {
        "date": str(today_dt),
        "total_sales": float(sales_today),
        "cash_sales": float(cash_sales),
        "credit_sales": float(credit_sales),
        "total_expenses": float(expenses_today),
        "net_cash_flow": float(cash_sales - expenses_today)
    }

@router.get("/reports/cash-drawer")
def get_cash_drawer():
    today_dt = datetime.now().date()
    
    # Calculate totals for today
    sales_today = 0
    credit_sales = 0
    cash_sales = 0
    
    if os.path.exists(TRANSACTIONS_FILE):
        df = pd.read_csv(TRANSACTIONS_FILE)
        df['date_dt'] = pd.to_datetime(df['date']).dt.date
        today_df = df[df['date_dt'] == today_dt]
        sales_today = today_df['amount'].sum()
        credit_sales = today_df[today_df['is_credit'] == True]['amount'].sum()
        cash_sales = today_df[today_df['is_credit'] == False]['amount'].sum()

    expenses_today = 0
    if os.path.exists(EXPENSES_FILE):
        edf = pd.read_csv(EXPENSES_FILE)
        edf['date_dt'] = pd.to_datetime(edf['date']).dt.date
        expenses_today = edf[edf['date_dt'] == today_dt]['amount'].sum()

    # For a real app, opening_balance would be stored. Here we calculate it simply.
    opening_balance = 5000.0 # Standard starting cash
    closing_balance = opening_balance + cash_sales - expenses_today

    return {
        "date": str(today_dt),
        "opening_balance": opening_balance,
        "cash_sales": float(cash_sales),
        "credit_sales": float(credit_sales),
        "expenses": float(expenses_today),
        "closing_balance": float(closing_balance)
    }


@router.get("/reports/daily-notification")
def get_daily_notification():
    # 1. Check settings
    enabled_daily = True
    enabled_live = True
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                sets = json.load(f)
                enabled_daily = sets.get("notifications_daily_reports", True)
                enabled_live = sets.get("notifications_live_alerts", True)
        except:
            pass
    
    if not enabled_daily and not enabled_live:
        return {"show": False}

    # 2. Daily Summary (if enabled)
    daily_data = None
    if enabled_daily:
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        yesterday_date = yesterday.strftime("%Y-%m-%d")
        
        revenue = 0
        top_product = "N/A"
        total_items = 0
        
        if os.path.exists(TRANSACTIONS_FILE):
            df = pd.read_csv(TRANSACTIONS_FILE)
            df['date_dt'] = pd.to_datetime(df['date']).dt.date
            yesterday_dt = pd.to_datetime(yesterday_date).date()
            
            yesterday_df = df[df['date_dt'] == yesterday_dt]
            if not yesterday_df.empty:
                revenue = yesterday_df['amount'].sum()
                total_items = len(yesterday_df)
                counts = yesterday_df['product'].value_counts()
                if not counts.empty:
                    top_product = counts.index[0]

        low_stock_count = 0
        if os.path.exists(INVENTORY_FILE):
            idf = pd.read_csv(INVENTORY_FILE)
            low_stock_count = len(idf[idf['quantity'] < 20])
            
        status = "NEUTRAL"
        if revenue > 5000:
            intel = f"Strategic Peak: Yesterday saw exceptionally high liquidity with ₹{revenue:,.0f} inflow. Top performing asset: {top_product}."
            status = "SUCCESS"
        elif revenue > 0:
            intel = f"Stable Operations: ₹{revenue:,.0f} captured across {total_items} sessions. {top_product} maintains its lead."
            status = "INFO"
        else:
            intel = "Market Quiet: No transaction telemetry recorded for yesterday."
            status = "WARNING"

        if low_stock_count > 0:
            intel += f" Critical: {low_stock_count} units require immediate replenishment."
        
        daily_data = {
            "date": yesterday_date,
            "status": status,
            "message": intel
        }

    # 3. Live Alerts (Last 2 Hours)
    live_alerts = []
    if enabled_live:
        if os.path.exists(NOTIFICATIONS_JSON):
            try:
                with open(NOTIFICATIONS_JSON, "r") as f:
                    all_events = json.load(f)
                
                two_hours_ago = datetime.now() - timedelta(hours=2)
                for event in all_events:
                    evt_time = datetime.fromisoformat(event["timestamp"])
                    if evt_time > two_hours_ago:
                        live_alerts.append(event)
                
                # Sort newest first
                live_alerts = sorted(live_alerts, key=lambda x: x["timestamp"], reverse=True)
            except:
                pass

    return {
        "show": True,
        "daily": daily_data,
        "live": live_alerts
    }
