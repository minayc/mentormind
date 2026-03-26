from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from backend.rag.retriever import search_query
from backend.llm.coach import get_reply, history
from backend.llm.evaluator import evaluate_answer

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    reply: str
    score: int
    feedback: str

@app.post("/session/message")
def session_message(req: MessageRequest) -> MessageResponse:

    chunks = search_query(req.message)
    eval_answer_dict = evaluate_answer(req.message, chunks)

    response = MessageResponse(reply=get_reply(req.message, history),
                    score=eval_answer_dict.get("score"),
                    feedback=eval_answer_dict.get("feedback"))

    return  response

