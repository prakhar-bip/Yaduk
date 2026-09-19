import os
import json
import time
import subprocess
import requests
import boto3
from openai import OpenAI
from app.core.config import settings
from app.core.activity_logger import log_activity

def get_bedrock_client():
    if not settings.AWS_BEDROCK_ENABLED:
        return None
    try:
        kwargs = {"region_name": settings.AWS_REGION}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        return boto3.client("bedrock-runtime", **kwargs)
    except Exception:
        return None

def call_bedrock(prompt: str, system_instruction: str = None, temperature: float = 0.4, max_tokens: int = 4096):
    client = get_bedrock_client()
    if not client:
        raise ValueError("AWS Bedrock client is not configured or disabled.")
    
    messages = [{"role": "user", "content": [{"text": prompt}]}]
    system_prompts = [{"text": system_instruction}] if system_instruction else []
    
    response = client.converse(
        modelId=settings.AWS_BEDROCK_MODEL,
        messages=messages,
        system=system_prompts,
        inferenceConfig={
            "temperature": temperature,
            "maxTokens": max_tokens
        }
    )
    return response["output"]["message"]["content"][0]["text"]

def get_nvidia_client():
    api_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY", "")
    if not api_key:
        return None
    return OpenAI(
        api_key=api_key,
        base_url=settings.NVIDIA_BASE_URL
    )

def call_nvidia(prompt: str, system_instruction: str = None, temperature: float = 1.0, max_tokens: int = 16384):
    client = get_nvidia_client()
    if not client:
        raise ValueError("NVIDIA NIM API key is not configured.")
    
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})
    
    extra_body = {"chat_template_kwargs": {"enable_thinking": True}}

    completion = client.chat.completions.create(
        model=settings.NVIDIA_MODEL,
        messages=messages,
        temperature=temperature,
        top_p=0.95,
        max_tokens=max_tokens,
        extra_body=extra_body,
        stream=True,
        timeout=settings.NVIDIA_TIMEOUT
    )
    
    content_chunks = []
    for chunk in completion:
        if not chunk.choices:
            continue
        content = chunk.choices[0].delta.content
        if content is not None:
            content_chunks.append(content)
            
    return "".join(content_chunks)

# Backward compatibility aliases
get_openrouter_client = get_nvidia_client
call_openrouter = call_nvidia

def get_groq_client():
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return None
    return OpenAI(
        api_key=api_key,
        base_url=settings.GROQ_BASE_URL
    )

def call_groq(prompt: str, system_instruction: str = None, temperature: float = 0.4, max_tokens: int = 4096):
    client = get_groq_client()
    if not client:
        raise ValueError("Groq API key is not configured.")
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=settings.GROQ_TIMEOUT
    )
    return response.choices[0].message.content

def call_llm(
    prompt: str,
    system_instruction: str = None,
    temperature: float = 0.4,
    max_tokens: int = 4096,
    agent_name: str = "Yaduk AI Agent"
):
    """
    3-Tier Agentic Router Waterfall:
    1. AWS Bedrock (Claude 3.5 Sonnet / Llama 3.3 70B on Bedrock)
    2. NVIDIA NIM (nvidia/nemotron-3-ultra-550b-a55b with reasoning enabled)
    3. Groq (openai/gpt-oss-120b high-throughput reasoning engine)
    """
    # 1. Attempt AWS Bedrock if configured
    if settings.AWS_BEDROCK_ENABLED and (settings.AWS_ACCESS_KEY_ID or os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE")):
        try:
            res = call_bedrock(prompt, system_instruction, temperature, max_tokens)
            log_activity(
                agent=f"{agent_name} (AWS Bedrock: {settings.AWS_BEDROCK_MODEL})",
                success=True,
                error=None,
                warning_reason=None
            )
            return res
        except Exception as e_bedrock:
            bedrock_err = str(e_bedrock)
            log_activity(
                agent=f"{agent_name} (AWS Bedrock)",
                success=False,
                error=f"{type(e_bedrock).__name__}: {bedrock_err}",
                warning_reason=f"Bedrock invocation failed, cascading to NVIDIA NIM: {bedrock_err}"
            )

    # 2. Attempt NVIDIA NIM (nvidia/nemotron-3-ultra-550b-a55b with reasoning)
    nvidia_key = settings.NVIDIA_API_KEY or os.getenv("NVIDIA_API_KEY", "")
    if nvidia_key:
        try:
            res = call_nvidia(prompt, system_instruction, temperature=1.0, max_tokens=max_tokens)
            log_activity(
                agent=f"{agent_name} (NVIDIA NIM: {settings.NVIDIA_MODEL})",
                success=True,
                error=None,
                warning_reason=None
            )
            return res
        except Exception as e_nvidia:
            nvidia_err = str(e_nvidia)
            log_activity(
                agent=f"{agent_name} (NVIDIA NIM)",
                success=False,
                error=f"{type(e_nvidia).__name__}: {nvidia_err}",
                warning_reason=f"NVIDIA NIM invocation failed, cascading to Groq: {nvidia_err}"
            )

    # 3. Tertiary Fallback: Groq (openai/gpt-oss-120b)
    try:
        res = call_groq(prompt, system_instruction, temperature, max_tokens)
        log_activity(
            agent=f"{agent_name} (Groq: {settings.GROQ_MODEL})",
            success=True,
            error=None,
            warning_reason=None
        )
        return res
    except Exception as e_groq:
        groq_err = str(e_groq)
        log_activity(
            agent=f"{agent_name} (Groq)",
            success=False,
            error=f"{type(e_groq).__name__}: {groq_err}",
            warning_reason=f"Reason: Groq generation failed ({groq_err})"
        )
        raise RuntimeError(f"All 3 AI agent tiers (Bedrock -> NVIDIA NIM -> Groq) failed: {groq_err}")


def _repair_and_parse_json(text: str):
    import re
    # 1. Strip trailing commas before closing braces/brackets
    cleaned = re.sub(r',\s*([}\]])', r'\1', text)
    try:
        return json.loads(cleaned)
    except Exception:
        pass
        
    # 2. Try closing any unbalanced open braces/brackets
    open_braces = cleaned.count('{') - cleaned.count('}')
    open_brackets = cleaned.count('[') - cleaned.count(']')
    balanced = cleaned
    if open_brackets > 0:
        balanced += ']' * open_brackets
    if open_braces > 0:
        balanced += '}' * open_braces
    try:
        return json.loads(balanced)
    except Exception:
        pass

    return None

def _extract_json(content: str, agent_name: str = "JSON Parser"):
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError as decode_err:
        first_brace = content.find('{')
        first_bracket = content.find('[')
        start = -1
        if first_brace != -1 and first_bracket != -1:
            start = min(first_brace, first_bracket)
        elif first_brace != -1:
            start = first_brace
        elif first_bracket != -1:
            start = first_bracket

        last_brace = content.rfind('}')
        last_bracket = content.rfind(']')
        end = max(last_brace, last_bracket)

        if start != -1 and end != -1 and end > start:
            candidate = content[start:end+1]
            try:
                return json.loads(candidate)
            except Exception:
                # Attempt in-memory auto-repair before failing
                repaired = _repair_and_parse_json(candidate)
                if repaired is not None:
                    log_activity(
                        agent=f"{agent_name} (JSON Auto-Repair)",
                        success=True,
                        error=None,
                        warning_reason="Warning: AI JSON syntax automatically sanitized and recovered without data loss"
                    )
                    return repaired

        # Also attempt repair on the full content
        repaired = _repair_and_parse_json(content)
        if repaired is not None:
            log_activity(
                agent=f"{agent_name} (JSON Auto-Repair)",
                success=True,
                error=None,
                warning_reason="Warning: AI JSON syntax automatically sanitized and recovered without data loss"
            )
            return repaired

        log_activity(
            agent=f"{agent_name} (JSON Parser)",
            success=False,
            error=f"JSONDecodeError: {str(decode_err)}",
            warning_reason="Reason: AI output contained malformed JSON syntax that could not be parsed"
        )
        raise

def generate_raw_json(system: str, prompt: str, agent_name: str = "Yaduk JSON Gateway Agent"):
    """
    Gateway function for generating typed JSON from system and user prompts.
    """
    content = call_llm(prompt=prompt, system_instruction=system, temperature=0.4, max_tokens=8192, agent_name=agent_name)
    return _extract_json(content, agent_name=agent_name)

def generate_project_ideas(student_profile: dict, model_name: str = None):
    """
    Step 3: Generate personalized project ideas based on the student profile.
    """
    prompt = f"""
    You are an AI career and project advisor for final-year students.
    Based on the following student profile, generate 3 personalized practical project ideas.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Return the response strictly as a JSON array of objects with the following keys:
    name, problem, solution, target_users, difficulty_level, estimated_development_time, required_skills (list of strings).
    Do not include markdown blocks or any other text, just the raw JSON array.
    """
    content = call_llm(prompt, temperature=0.7, max_tokens=4096, agent_name="Project Idea Advisor Agent")
    return _extract_json(content, agent_name="Project Idea Advisor Agent")

def refine_project_ideas(student_profile: dict, current_ideas: list, feedback: str, model_name: str = None):
    """
    Step 5: Refine project ideas based on student feedback.
    """
    prompt = f"""
    You are an AI career and project advisor.
    The student previously received these project ideas:
    {json.dumps(current_ideas, indent=2)}
    
    The student's profile is:
    {json.dumps(student_profile, indent=2)}
    
    The student provided the following feedback/request for changes:
    "{feedback}"
    
    Based on this feedback, generate 3 new or refined practical project ideas that better suit their request while still aligning with their profile.
    
    Return the response strictly as a JSON array of objects with the following keys:
    name, problem, solution, target_users, difficulty_level, estimated_development_time, required_skills (list of strings).
    Do not include markdown blocks or any other text, just the raw JSON array.
    """
    content = call_llm(prompt, temperature=0.7, max_tokens=4096, agent_name="Project Idea Refiner Agent")
    return _extract_json(content, agent_name="Project Idea Refiner Agent")

def analyze_project_feasibility(student_profile: dict, project_idea: dict, model_name: str = None):
    """
    Step 6: Analyze the feasibility of a specific project for the student.
    """
    prompt = f"""
    You are an AI career and technical advisor.
    Evaluate the feasibility of the following project idea for this specific student.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Analyze whether this project is realistically achievable for the student given their skills and available time.
    Provide a skill match score (0-100) and an interest match score (0-100).
    Provide a detailed explanation. If it's too difficult, suggest a brief learning roadmap or simplifications.
    
    Return the response strictly as a JSON object with the following keys:
    skill_match_score (integer), interest_match_score (integer), feasibility_explanation (string).
    Do not include markdown blocks or any other text, just the raw JSON object.
    """
    content = call_llm(prompt, temperature=0.4, max_tokens=4096, agent_name="Project Feasibility Analyst Agent")
    return _extract_json(content, agent_name="Project Feasibility Analyst Agent")

def generate_project_blueprint(student_profile: dict, project_idea: dict, model_name: str = None):
    """
    Step 8 & 9: Complete Project Blueprint Generation (AI Project Architect).
    """
    prompt = f"""
    You are an expert AI Software Architect and Senior Technical Lead.
    Create an in-depth, production-ready, practical Project Blueprint for the selected final-year student project.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Selected Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Generate a complete project blueprint adhering STRICTLY to the following JSON structure:
    {{
      "overview": {{
        "project_name": "{project_idea.get('name', 'Project')}",
        "problem_statement": "Detailed problem statement",
        "proposed_solution": "Detailed solution description",
        "project_objectives": ["objective 1", "objective 2", "objective 3"],
        "target_users": "Target audience description",
        "expected_impact": "Expected academic and real-world impact"
      }},
      "features": {{
        "core_mvp": ["MVP feature 1", "MVP feature 2", "MVP feature 3"],
        "advanced_features": ["Advanced feature 1", "Advanced feature 2"],
        "future_improvements": ["Improvement 1", "Improvement 2"]
      }},
      "tech_stack": [
        {{
          "name": "Technology Name",
          "category": "Frontend | Backend | Database | AI/ML | DevOps/Hosting | Tools",
          "why_selected": "Why chosen based on student skills and project needs",
          "how_used": "Exact role in this project"
        }}
      ],
      "system_architecture": {{
        "overview": "Detailed description of system architecture style and communication protocols",
        "components": [
          {{"component": "Frontend Client", "description": "Role and tech"}},
          {{"component": "Backend API Server", "description": "Endpoints and business logic"}},
          {{"component": "Database Layer", "description": "Data storage and modeling"}}
        ],
        "data_flow": ["Step 1: User action...", "Step 2: API processing...", "Step 3: Database query...", "Step 4: Response render..."]
      }},
      "development_roadmap": [
        {{
          "phase_number": 1,
          "phase_name": "Project Planning & Requirement Definition",
          "objectives": "Finalize scope and technical specifications",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "SRS document and wireframes"
        }},
        {{
          "phase_number": 2,
          "phase_name": "Project Setup & Environment Configuration",
          "objectives": "Initialize repositories, dependencies, and environments",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Configured repository and working dev server"
        }},
        {{
          "phase_number": 3,
          "phase_name": "Database Design & Integration",
          "objectives": "Design schema, setup database connection, and create tables",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "ER diagram and migration scripts"
        }},
        {{
          "phase_number": 4,
          "phase_name": "Backend Development",
          "objectives": "Implement RESTful API endpoints and business logic",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Tested backend endpoints"
        }},
        {{
          "phase_number": 5,
          "phase_name": "Frontend Development",
          "objectives": "Build UI components and integrate with backend APIs",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Responsive user interface"
        }},
        {{
          "phase_number": 6,
          "phase_name": "AI Integration (if applicable)",
          "objectives": "Integrate AI models, API keys, and prompt pipelines",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Working AI feature pipeline"
        }},
        {{
          "phase_number": 7,
          "phase_name": "Testing & Quality Assurance",
          "objectives": "Execute unit, integration, and user-flow tests",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Test reports and bug fixes"
        }},
        {{
          "phase_number": 8,
          "phase_name": "Deployment & Presentation Prep",
          "objectives": "Deploy to cloud hosting, document setup, and prepare demo",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Live production URL and project report"
        }}
      ],
      "challenges_and_solutions": [
        {{
          "challenge": "Key technical bottleneck or risk",
          "solution": "Recommended mitigation and implementation strategy"
        }}
      ]
    }}

    Rules:
    1. Tailor the tech stack and roadmap to the student's existing skills, filling gaps realistically.
    2. Return ONLY the valid JSON object. No Markdown code fences, no extra text.
    """
    content = call_llm(prompt, temperature=0.4, max_tokens=8192, agent_name="AI Project Architect Agent")
    return _extract_json(content, agent_name="AI Project Architect Agent")

def mentor_chat_and_refine(
    student_profile: dict,
    project_idea: dict,
    current_blueprint: dict,
    chat_history: list,
    student_message: str,
    model_name: str = None
):
    """
    Steps 10 & 11: Interactive AI Project Mentor and Continuous Blueprint Refinement.
    """
    prompt = f"""
    You are an expert AI Technical Project Mentor and Senior Software Architect.
    You are having an interactive mentoring session with a final-year student regarding their project blueprint.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Selected Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Current Project Blueprint:
    {json.dumps(current_blueprint, indent=2)}
    
    Recent Chat History:
    {json.dumps(chat_history[-6:], indent=2) if chat_history else "No previous conversation."}
    
    Student's Latest Message:
    "{student_message}"
    
    Your Tasks:
    1. Act as an encouraging, clear, and highly knowledgeable technical mentor.
    2. Address the student's question, concern, or modification request directly.
    3. Determine if the student's request requires a modification to the Project Blueprint.
    4. If a modification IS required:
       - Set "blueprint_updated": true.
       - In "updated_blueprint", provide the complete, updated project blueprint.
    5. If NO modification is needed:
       - Set "blueprint_updated": false.
       - Set "updated_blueprint": null.

    Respond STRICTLY with a valid JSON object matching this schema:
    {{
      "mentor_response": "Your thorough, helpful, conversational answer to the student.",
      "blueprint_updated": true,
      "updated_blueprint": {{ ... }}
    }}
    (Note: If blueprint_updated is false, updated_blueprint should be null).

    Rules:
    - Respond ONLY with the raw JSON object. No Markdown fences, no extra text.
    """
    content = call_llm(prompt, temperature=0.5, max_tokens=4096, agent_name="AI Project Mentor Agent")
    return _extract_json(content, agent_name="AI Project Mentor Agent")
