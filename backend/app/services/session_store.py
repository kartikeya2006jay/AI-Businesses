sessions = {}

def save_chat(session_id, question, response):

    if session_id not in sessions:
        sessions[session_id] = []

    sessions[session_id].append({
        "question": question,
        "response": response
    })


def get_session(session_id):
    return sessions.get(session_id, [])