from datetime import datetime, timedelta
import pytz

IST = pytz.timezone("Asia/Kolkata")

def get_today():
    return datetime.now(IST).date()

def get_yesterday():
    return get_today() - timedelta(days=1)