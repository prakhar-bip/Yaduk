from fastapi import FastAPI, Request
from app.core.config import settings
from app.core.activity_logger import log_activity, print_log_header
from app.api.endpoints import discovery, projects, gateway, auth
from app.db.database import engine, Base
from app.models import student, project, user
from fastapi.middleware.cors import CORSMiddleware

# Create DB tables safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    print(f"Database initialization notice: {exc}")

# Print terminal log header once on startup
print_log_header()

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def activity_logging_middleware(request: Request, call_next):
    # Skip noise like favicon or docs schema
    if request.url.path in ("/favicon.ico", "/openapi.json"):
        return await call_next(request)

    try:
        response = await call_next(request)
        if response.status_code >= 400:
            log_activity(
                agent=f"System Gateway [{request.method} {request.url.path}]",
                success=False,
                error=f"HTTP {response.status_code}",
                warning_reason=f"Reason: Request completed with HTTP status {response.status_code}"
            )
        elif request.url.path == "/":
            log_activity(
                agent="System Gateway [GET /]",
                success=True,
                error=None,
                warning_reason=None
            )
        return response
    except Exception as exc:
        log_activity(
            agent=f"System Gateway [{request.method} {request.url.path}]",
            success=False,
            error=f"{type(exc).__name__}: {str(exc)}",
            warning_reason="Reason: Unhandled exception during HTTP request processing"
        )
        raise exc

app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["Auth"])
app.include_router(discovery.router, prefix=settings.API_V1_STR + "/discovery", tags=["Discovery"])
app.include_router(projects.router, prefix=settings.API_V1_STR + "/projects", tags=["Projects"])
app.include_router(gateway.router, prefix=settings.API_V1_STR + "/gateway", tags=["Gateway"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Yaduk AI Backend"}
