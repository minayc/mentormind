# GOAL: Run a Socratic conversation loop in the terminal.
# 1. Load the Groq API key from .env
# 2. Define a system prompt that makes the LLM teach, not just answer
# 3. Accept a user message from the terminal
# 4. Retrieve relevant chunks using search_query() from retriever.py
# 5. Build the full prompt: system + context + conversation history + user message
# 6. Send to Groq and print the response
# 7. Save the exchange to conversation history
# 8. Loop until user types 'exit'

import os
import sys
from backend.rag.retriever import search_query
from dotenv import load_dotenv
from groq import Groq


load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key)

SYSTEM_PROMPT = """
You are a Socratic tutor. Your job is to help the user learn 
through questions, not by giving direct answers. When the user
asks something, respond with a guiding question that helps them
think it through themselves. Use the provided context to inform
your questions but never quote it directly. Your attitude should 
be like a professor helping a student.
"""

history = [
    {"role": "system", "content": SYSTEM_PROMPT},
]

def get_reply(user_message:str, history: list) -> str:

    chunks = search_query(user_message)
    context = "\n\n".join(chunks) # Converts the items in the list into joined strings(\n\n gave a balnk sentece in between them)
    combined = f"Context:\n{context}\n\nQuestion:{user_message}"
    history.append({"role": "user", "content": combined})
    response = client.chat.completions.create(model="llama-3.1-8b-instant", messages=history)
    history.append({"role": "assistant", "content": response.choices[0].message.content})

    return response.choices[0].message.content


if __name__ == "__main__":
    history = [{"role": "system", "content": SYSTEM_PROMPT}]
    while True:
        user_message = input("Ask: ")
        if user_message == "exit":
            sys.exit(0)
        reply = get_reply(user_message, history)
        print(f"\nTutor: {reply}\n")

