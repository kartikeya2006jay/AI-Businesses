import re
from datetime import datetime

def extract_date(question: str):

    # pattern like "14 march 2026"
    pattern = r'(\d{1,2}\s+[a-zA-Z]+\s+\d{4})'

    match = re.search(pattern, question)

    if match:
        try:
            parsed = datetime.strptime(match.group(1), "%d %B %Y")
            return parsed.date()
        except:
            return None

    return None