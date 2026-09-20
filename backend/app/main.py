from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.activity_logger import log_activity, print_log_header
from app.api.endpoints import discovery, projects, gateway, auth, health, artifacts, codegen
from app.db.database import engine, Base, get_db
from app.models import student, project, user
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Database initialization
# For production, use: alembic upgrade head
# For development convenience, auto-create tables if they don't exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    print(f"Database initialization notice: {exc}")

# Print terminal log header once on startup
print_log_header()

# Rate limiter (in-memory; use Redis for multi-instance deployments)
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
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
app.include_router(health.router, prefix=settings.API_V1_STR + "/health", tags=["Health"])
app.include_router(artifacts.router, prefix=settings.API_V1_STR + "/artifacts", tags=["Artifacts"])
app.include_router(codegen.router, prefix=settings.API_V1_STR + "/codegen", tags=["CodeGen"])

@app.get("/health", tags=["Health"])
def root_health(db: Session = Depends(get_db)):
    return health.check_health(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to Yaduk AI Backend"}
