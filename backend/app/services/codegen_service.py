"""
Yaduk CodeGen Service — Per-File Code Generation with Full Context Injection.

Instead of generating an entire codebase in one LLM call (which produces stubs),
this service generates ONE file at a time, giving the LLM the full 8K token budget
for a single file along with the complete knowledge base context.
"""

import time
from app.services.ai_service import call_llm
from app.core.activity_logger import log_activity
from app.services.cloudwatch_service import publish_ai_metric, publish_student_event


def generate_single_file(
    file_path: str,
    file_purpose: str,
    project_title: str,
    blueprint_summary: str = "",
    db_schema_ddl: str = "",
    api_routes: list = None,
    theme: dict = None,
    approved_dependencies: list = None,
    existing_files: dict = None,
    mvp_features: list = None,
    screen_context: dict = None,
) -> str:
    """
    Generate a single complete source code file using LLM with full context injection.

    Each file gets the entire 8,192 token budget (instead of sharing it across 11+ files),
    resulting in dense, production-quality code instead of stubs.

    Args:
        file_path: e.g. "backend/app/routers/candidates.py"
        file_purpose: e.g. "CRUD operations for candidate screening"
        project_title: e.g. "AI Resume Screener"
        blueprint_summary: Project overview text
        db_schema_ddl: Full SQL DDL for relevant tables
        api_routes: List of API route dicts relevant to this file
        theme: Dict with primary, secondary, accent, dark, headingFont, bodyFont
        approved_dependencies: List of {name, purpose} dicts
        existing_files: Dict of {path: code} for already-generated files (import consistency)
        mvp_features: List of {name, detail} dicts for this screen's features
        screen_context: Dict with screen, route, apiEndpoints, dbEntities
    """
    sections = []

    # Core file identity
    sections.append(f"You are generating ONE complete source code file: `{file_path}`")
    sections.append(f"Project: \"{project_title}\"")
    sections.append(f"Purpose of this file: {file_purpose}")

    # Blueprint context
    if blueprint_summary:
        sections.append(f"\n=== PROJECT OVERVIEW ===\n{blueprint_summary[:1500]}")

    # Screen-specific context
    if screen_context:
        sections.append("\n=== THIS FILE'S SCREEN ===")
        sections.append(f"Screen: {screen_context.get('screen', 'N/A')}")
        sections.append(f"Route: {screen_context.get('route', '/')}")
        if screen_context.get('apiEndpoints'):
            sections.append(f"API Endpoints Used: {', '.join(screen_context['apiEndpoints'])}")
        if screen_context.get('dbEntities'):
            sections.append(f"Database Tables: {', '.join(screen_context['dbEntities'])}")

    # MVP features for this screen
    if mvp_features:
        sections.append("\n=== MVP FEATURES FOR THIS SCREEN ===")
        for feat in mvp_features[:6]:
            if isinstance(feat, dict):
                sections.append(f"- {feat.get('name', '')}: {feat.get('detail', '')}")
            else:
                sections.append(f"- {feat}")

    # Database schema
    if db_schema_ddl:
        # Truncate very long DDLs to save prompt tokens
        ddl = db_schema_ddl[:3000] if len(db_schema_ddl) > 3000 else db_schema_ddl
        sections.append(f"\n=== DATABASE SCHEMA (SQL DDL) ===\n{ddl}")

    # API routes this file must implement
    if api_routes:
        sections.append("\n=== API ROUTES TO IMPLEMENT ===")
        for route in api_routes[:10]:
            if isinstance(route, dict):
                method = route.get('method', 'GET')
                path = route.get('route', '/')
                summary = route.get('summary', '')
                sections.append(f"  {method} {path}: {summary}")
                if route.get('requestPayload'):
                    sections.append(f"    Request Body: {route['requestPayload'][:300]}")
                if route.get('responsePayload'):
                    sections.append(f"    Response: {route['responsePayload'][:300]}")
                if route.get('authRequired'):
                    sections.append(f"    Auth: Required")

    # Theme / Design system
    if theme:
        sections.append("\n=== DESIGN SYSTEM & THEME ===")
        sections.append(f"Primary Color: {theme.get('primary', '#0F172A')}")
        sections.append(f"Secondary Color: {theme.get('secondary', '#0284C7')}")
        sections.append(f"Accent Color: {theme.get('accent', '#10B981')}")
        sections.append(f"Dark Background: {theme.get('dark', '#020617')}")
        sections.append(f"Heading Font: {theme.get('headingFont', 'Inter')}")
        sections.append(f"Body Font: {theme.get('bodyFont', 'sans-serif')}")
        if theme.get('borderRadius'):
            sections.append(f"Border Radius: {theme['borderRadius']}")

    # Approved dependencies
    if approved_dependencies:
        sections.append("\n=== APPROVED DEPENDENCIES (import ONLY from these) ===")
        for dep in approved_dependencies[:20]:
            if isinstance(dep, dict):
                sections.append(f"- {dep.get('name', '')}: {dep.get('purpose', '')}")
            else:
                sections.append(f"- {dep}")

    # Already-generated files for import consistency
    if existing_files:
        sections.append("\n=== ALREADY GENERATED FILES (use for import consistency) ===")
        for fpath, code in list(existing_files.items())[:5]:
            # Truncate each file to avoid prompt overflow
            truncated = code[:2000] if len(code) > 2000 else code
            sections.append(f"\n--- {fpath} ---\n{truncated}")

    # Critical instructions
    sections.append(f"""
=== CRITICAL INSTRUCTIONS ===
1. Generate ONLY the content of `{file_path}` — no other files
2. Write COMPLETE, PRODUCTION-GRADE code — no stubs, no TODOs, no placeholders, no "// Add more here"
3. Every function must be FULLY IMPLEMENTED with real logic, real DB queries, real validation
4. Include proper error handling, input validation, and edge case handling
5. Use the exact imports from approved dependencies only
6. Match the database schema and API contracts exactly
7. Apply the theme colors and fonts in all UI components (use Tailwind classes with custom values)
8. Do NOT wrap the output in markdown code fences (```) or file delimiters (=== FILE ===)
9. Output raw source code only — the first character should be an import statement or comment
10. For React components: include loading states, error handling, responsive design, and real data fetching
11. For Python files: include type hints, docstrings, and proper HTTP status codes
""")

    prompt = "\n".join(sections)

    system = (
        "You are a Principal Full-Stack Software Engineer at a top-tier tech company. "
        "You write complete, production-quality source code that ships to real users. "
        "Every function is FULLY IMPLEMENTED with real business logic — never stubs, never placeholders, never TODOs. "
        "You output ONLY raw source code — no markdown formatting, no explanations, no surrounding text, no code fences. "
        "The first line of your output should be a code comment or import statement."
    )

    start_time = time.time()
    try:
        code = call_llm(
            prompt=prompt,
            system_instruction=system,
            temperature=0.15,
            max_tokens=8192,
            agent_name=f"Yaduk CodeGen [{file_path}]",
            task_type="deep"
        )

        # Strip any markdown code fences the LLM might add despite instructions
        code = _strip_code_fences(code)

        elapsed_ms = (time.time() - start_time) * 1000
        log_activity(
            agent=f"CodeGen Service [{file_path}]",
            success=True,
            error=None,
            warning_reason=None
        )
        publish_ai_metric(
            agent_name=f"CodeGen [{file_path}]",
            model_tier="codegen",
            latency_ms=elapsed_ms,
            success=True,
            task_type="deep"
        )
        return code

    except Exception as e:
        elapsed_ms = (time.time() - start_time) * 1000
        log_activity(
            agent=f"CodeGen Service [{file_path}]",
            success=False,
            error=str(e),
            warning_reason=f"File generation failed after {elapsed_ms:.0f}ms: {str(e)}"
        )
        publish_ai_metric(
            agent_name=f"CodeGen [{file_path}]",
            model_tier="codegen",
            latency_ms=elapsed_ms,
            success=False,
            task_type="deep"
        )
        raise


def _strip_code_fences(code: str) -> str:
    """Remove markdown code fences from LLM output if present."""
    code = code.strip()

    # Strip opening fence: ```python, ```typescript, ```sql, etc.
    if code.startswith("```"):
        lines = code.split("\n")
        # Remove first line if it's a fence
        if lines[0].strip().startswith("```"):
            lines = lines[1:]
        # Remove last line if it's a closing fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        code = "\n".join(lines)

    return code.strip()
