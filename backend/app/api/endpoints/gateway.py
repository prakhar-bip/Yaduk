from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from app.services.ai_service import generate_raw_json, call_llm

router = APIRouter()

class GenerateJsonRequest(BaseModel):
    system: str
    prompt: str
    agent_name: Optional[str] = "Yaduk JSON Gateway Agent"

class GenerateTextRequest(BaseModel):
    system: Optional[str] = None
    prompt: str
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = 8192
    agent_name: Optional[str] = "Yaduk Code Architect Agent"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Any]
    context: Optional[dict] = None

@router.post("/generate-json")
def gateway_generate_json(req: GenerateJsonRequest):
    """
    Direct JSON generation bridge for frontend server functions using zero-cost Nvidia NIM.
    """
    try:
        data = generate_raw_json(
            system=req.system,
            prompt=req.prompt,
            agent_name=req.agent_name or "Yaduk JSON Gateway Agent"
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JSON generation failed: {str(e)}")

@router.post("/generate-text")
def gateway_generate_text(req: GenerateTextRequest):
    """
    Direct code and text generation bridge for frontend server functions using zero-cost Nvidia NIM.
    Ideal for source code files, documentation, and markdown artifacts with zero JSON escaping friction.
    """
    try:
        text = call_llm(
            prompt=req.prompt,
            system_instruction=req.system,
            temperature=req.temperature or 0.3,
            max_tokens=req.max_tokens or 8192,
            agent_name=req.agent_name or "Yaduk Code Architect Agent"
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text generation failed: {str(e)}")

@router.post("/chat")
def gateway_chat(req: ChatRequest):
    """
    Direct mentor chat response using AWS Bedrock with Groq fallback.
    """
    try:
        system = (
            "You are Yaduk, the AI Project Mentor and Architect, dedicated to guiding engineering students through architecting and building top-tier final-year and flagship capstone projects. "
            "You know their profile and their current project blueprint. Answer questions about implementation, "
            "stack choices, scope, alternatives and complexity. Be concrete, helpful, and concise."
        )
        if req.context:
            system += f"\n\nCONTEXT:\n{str(req.context)[:8000]}"
            
        last_msg = ""
        for m in reversed(req.messages):
            if isinstance(m, dict) and m.get("content"):
                last_msg = str(m.get("content"))
                break
            elif isinstance(m, str):
                last_msg = m
                break
                
        if not last_msg:
            last_msg = "Hello mentor, can you help me with my project?"
            
        text = call_llm(prompt=last_msg, system_instruction=system, temperature=0.6, max_tokens=1024, agent_name="Yaduk Direct Chat Mentor Agent")
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mentor chat failed: {str(e)}")
