import sys
import os
import pandas as pd

# Add the backend directory to sys.path to import app
sys.path.append('/home/kartikeyayadav/Desktop/paytm-ai-merchant-copilot/backend')

from app.utils.data_loader import load_inventory
from app.api.transactions_api import update_inventory
from app.models.user_model import User

def test_multi_user_isolation():
    print("Testing Multi-User Isolation...")
    
    # Mock users
    user_a = User(username="user_a", email="a@example.com")
    user_b = User(username="user_b", email="b@example.com")
    
    # User A adds an item
    from app.api.transactions_api import InventoryItem
    item_a = InventoryItem(product="Apple", price=10.0, quantity=100)
    update_inventory(item_a, current_user=user_a)
    
    # User B adds an item
    item_b = InventoryItem(product="Banana", price=5.0, quantity=200)
    update_inventory(item_b, current_user=user_b)
    
    # Check User A inventory
    inv_a = load_inventory(username="user_a")
    print(f"User A inventory: {inv_a['product'].tolist()}")
    assert "Apple" in inv_a['product'].tolist()
    assert "Banana" not in inv_a['product'].tolist()
    
    # Check User B inventory
    inv_b = load_inventory(username="user_b")
    print(f"User B inventory: {inv_b['product'].tolist()}")
    assert "Banana" in inv_b['product'].tolist()
    assert "Apple" not in inv_b['product'].tolist()
    
    print("Isolation Test Passed!")

if __name__ == "__main__":
    try:
        test_multi_user_isolation()
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
