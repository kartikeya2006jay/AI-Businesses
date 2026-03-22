import pandas as pd
import os

def load_transactions():
    """Load transaction history from CSV."""
    if not os.path.exists("data/transactions.csv"):
        # Create empty if not exists to prevent crash
        return pd.DataFrame(columns=["product", "quantity", "amount", "date"])
    
    df = pd.read_csv("data/transactions.csv")
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df

def load_inventory():
    """Load current inventory from CSV."""
    if not os.path.exists("data/inventory.csv"):
        return pd.DataFrame(columns=["product", "price", "quantity"])
        
    return pd.read_csv("data/inventory.csv")

def load_lending():
    """Load lending (Khata Book) data from CSV."""
    if not os.path.exists("data/lending.csv"):
        return pd.DataFrame(columns=["customer_name", "amount", "status", "due_date"])
    return pd.read_csv("data/lending.csv")

def load_data():
    """Legacy alias for load_transactions."""
    return load_transactions()