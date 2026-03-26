# GOAL: Grade a user's answer against the retrieved context.
# 1. Load the Gemini API key from .env
# 2. Accept two inputs: the user's answer and a list of context chunks
# 3. Build a grading prompt combining the answer and context
# 4. Send to Gemini Flash and ask for a score (0-10) + feedback
# 5. Parse the response and return {"score": int, "feedback": str}

import os
from dotenv import load_dotenv
from google import genai
import json
import  re


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def evaluate_answer(user_answer: str, context_chunks: list[str]) -> dict:
    context= "\n\n".join(context_chunks)

    prompt = f"""
    You are a tutor that grades their student's answers accurately 
    based on the context below:
    
    Context:
    {context}
    
    Student's answer:
    {user_answer}
    
    Grade the answer from 0 to 10 and provide a useful and polite feedback.
    Return ONLY a JSON object like this:
    {{"score": 7, "feedback": "good answer but missing..."}}
    No extra text prior or after.
    """
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt, config={"response_mime_type": "application/json"})

    response_text = getattr(response, "text", "") or ""

    if not response_text.strip():
        return  {"score": 0, "feedback": "Could not evaluate answer. Please try again"}

    try:
        match = re.search(r"\{.*}", response_text, re.DOTALL)
        if not match:
            raise ValueError("No JSON found")

        structured_response = json.loads(match.group())

        if not isinstance(structured_response, dict):
            raise  ValueError("Not a dict")

        if "score" not in structured_response or "feedback" not in structured_response:
            raise ValueError("Missing keys")

        return structured_response

    except Exception:
        return {"score": 0, "feedback": "Invalid response format from model"}


if __name__ == "__main__":
    test_chunks = ["Embeddings are numerical representations of words in vector space."]
    result = evaluate_answer("An embedding is a list of numbers.", test_chunks)
    print(result)

