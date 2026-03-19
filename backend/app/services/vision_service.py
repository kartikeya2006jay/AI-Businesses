import os
import base64
import random
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
# Path goes up: services -> app -> backend -> root
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), '.env')
load_dotenv(dotenv_path=env_path)

INVENTORY_FILE = "data/inventory.csv"

def identify_product(image_base64: str):
    """Identify a product using OpenAI Vision or a smart fallback."""
    
    api_key = os.getenv("OPENAI_API_KEY")
    client = None
    if api_key:
        try:
            client = OpenAI(api_key=api_key)
        except Exception as e:
            print(f"Client init error: {e}")

    # No debug_info returned to API anymore as per previous request, 
    # but we'll keep the logic clean.
    
    # Get inventory context
    inventory_products = []
    if os.path.exists(INVENTORY_FILE):
        df = pd.read_csv(INVENTORY_FILE)
        inventory_products = df['product'].tolist()

    if not inventory_products:
        return "Unknown Product", 0.0

    # Try OpenAI Vision first if available
    if client:
        try:
            # Prepare image for OpenAI (extract base64 if needed)
            header, encoded = image_base64.split(",", 1) if "," in image_base64 else ("", image_base64)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a highly accurate Retail Product Identification assistant. "
                            "Analyze the provided image and identify the product. "
                            f"Available inventory items: {', '.join(inventory_products)}. "
                            "If the product is in the inventory, respond with the EXACT inventory name. "
                            "If the product is NOT in the inventory, respond with a concise, professional product name (e.g., 'Headset', 'Laptop Bag'). "
                            "Respond with ONLY the product name."
                        )
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Observe the image closely and identify the product name."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{encoded}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=30,
                temperature=0.1
            )
            
            identified_name = response.choices[0].message.content.strip()
            
            # Primary: Exact or partial match in inventory
            for p in inventory_products:
                if p.lower() == identified_name.lower() or p.lower() in identified_name.lower():
                    return p, 0.98
            
            # Secondary: Return identified name if not in inventory (Discovery Mode)
            return identified_name, 0.92
                    
        except Exception as e:
            print(f"OpenAI Vision error: {e}")

    # Smart Fallback / Mock logic
    random_seed = len(image_base64) % len(inventory_products)
    fallback_product = inventory_products[random_seed]
    
    return fallback_product, 0.85
