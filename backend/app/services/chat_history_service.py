from app.memory.sessions import sessions

def get_history(session_id):

    if session_id not in sessions:
        sessions[session_id] = []

    return sessions[session_id]


def add_message(session_id, role, content):

    sessions[session_id].append({
        "role": role,
        "content": content
    })