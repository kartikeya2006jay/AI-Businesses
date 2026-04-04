import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
NOTIFICATIONS_JSON = os.path.join(DATA_DIR, "notifications.json")

def log_event(event_type, title, text):
    """Logs a live event to notifications.json for real-time alerts."""
    try:
        events = []
        if os.path.exists(NOTIFICATIONS_JSON):
            with open(NOTIFICATIONS_JSON, "r") as f:
                events = json.load(f)
        
        new_event = {
            "id": f"evt_{datetime.now().timestamp()}",
            "type": event_type,
            "title": title,
            "text": text,
            "timestamp": datetime.now().isoformat()
        }
        events.append(new_event)
        
        # Keep only last 50 events to prevent file bloat
        events = events[-50:]
        
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
            
        with open(NOTIFICATIONS_JSON, "w") as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        print(f"Error logging event: {e}")
