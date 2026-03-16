from datetime import datetime, timedelta

def parse_time_range(question: str):

    today = datetime.today().date()

    if "yesterday" in question.lower():
        start = today - timedelta(days=1)
        end = start

    elif "today" in question.lower():
        start = today
        end = today

    elif "last week" in question.lower():
        start = today - timedelta(days=7)
        end = today

    elif "last month" in question.lower():
        start = today - timedelta(days=30)
        end = today

    else:
        start = None
        end = None

    return start, end