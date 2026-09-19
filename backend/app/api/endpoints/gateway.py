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
    system: Optional[str] = None

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
            agent_name=req.agent_name or "Yaduk Code Architect Agent",
            task_type="deep"
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text generation failed: {str(e)}")

@router.post("/chat")
def gateway_chat(req: ChatRequest):
    """
    Direct mentor chat response using task-aware router with Groq fallback.
    """
    try:
        if req.system and req.system.strip():
            system = req.system.strip()
        else:
            system = (
                "You are Yaduk, the expert AI Project Mentor and Systems Architect.\n\n"
                "MANDATORY 3-PART RESPONSE STRUCTURE:\n"
                "### 🎯 Core Verdict\n"
                "[1-2 crisp sentences directly answering the query with zero fluff. Bold key terms.]\n\n"
                "### ⚙️ Technical Breakdown\n"
                "- **Architecture / Decision:** Concrete technical rationale.\n"
                "- **Implementation / Trade-off:** Practical engineering reason (latency, complexity, tooling).\n\n"
                "### 🚀 Immediate Next Move\n"
                "🎯 **What to do next:** [1 immediate, specific command or code action to perform now.]\n\n"
                "> 💡 **Supervisor / Viva Tip:** [1 sentence explaining how to defend this choice in your evaluation.]\n\n"
                "Never output multi-column markdown tables or raw HTML tags. Keep total length around 120-160 words."
            )
        if req.context and not req.system:
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
            
        text = call_llm(
            prompt=last_msg,
            system_instruction=system,
            temperature=0.6,
            max_tokens=4096,
            agent_name="Yaduk Direct Chat Mentor Agent",
            task_type="fast"
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mentor chat failed: {str(e)}")
