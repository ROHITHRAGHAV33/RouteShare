import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import Base, engine
from app.routers import auth, routes, search, bookings, drivers, admin, vehicles

# Create database tables (use Alembic migrations in production instead).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for the AI-Based Empty-Return Truck Sharing and Freight Optimization System.",
    version="1.0.0",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Security headers (Helmet-equivalent) ----------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ---------- Simple in-memory rate limiting (per client IP) ----------
_request_log: dict = defaultdict(deque)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0
    log = _request_log[client_ip]

    while log and now - log[0] > window:
        log.popleft()

    if len(log) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Please slow down and try again shortly."},
        )

    log.append(now)
    return await call_next(request)


# ---------- Validation error handler (clean, non-leaky error messages) ----------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(x) for x in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(drivers.router)
app.include_router(admin.router)
app.include_router(vehicles.router)


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME, "environment": settings.ENV}
