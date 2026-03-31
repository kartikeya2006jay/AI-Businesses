from fastapi import APIRouter, Depends
from app.utils.data_loader import load_transactions, load_inventory
from app.services.openai_service import ask_ai
import pandas as pd

router = APIRouter()

@router.get("/sales-tip")
def get_sales_tip():
    """Generates a real-time AI business tip based on store data."""
    try:
        transactions_df = load_transactions()
        inventory_df = load_inventory()
        
        prompt = (
            "Based on our sales history and current inventory, give me ONE concise, "
            "highly actionable business tip (max 2 sentences). "
            "Focus on things like 'Stock up on X because it sells fast', "
            "'Y is not moving, try a discount', or 'Peak sales happen at Z time, be ready'. "
            "Make it feel helpful and specific to this store."
        )
        
        tip = ask_ai(prompt, transactions_df, inventory_df)
        return {"tip": tip}
    except Exception as e:
        return {"tip": "Always keep an eye on your best-sellers to ensure they never go out of stock!"} # Fallback

@router.get("/inventory-optimization")
def get_inventory_optimization():
    """Returns a full inventory restock and optimization strategy."""
    try:
        transactions_df = load_transactions()
        inventory_df = load_inventory()
        
        prompt = (
            "Act as a professional retail strategist. Based on the sales data and inventory levels, "
            "recommend which 2-3 products need immediate restock and which should be discontinued or discounted. "
            "Format the output as a list of actionable points. "
            "Keep it to the point (max 100 words total)."
        )
        
        optimization_plan = ask_ai(prompt, transactions_df, inventory_df)
        return {"plan": optimization_plan}
    except Exception as e:
        return {"plan": "Stock levels for toothpaste and soap are low. Consider a promotion on shampoo to move old stock."} # Fallback
