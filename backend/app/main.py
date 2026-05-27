import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.routes import auth, documents, search, filters, weaviate as weaviate_routes
from app.services.embedding import build_provider
from app.services.weaviate_service import WeaviateService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Provider construction may download a model (FastEmbed) and connect()
    # / bootstrap_collection() block on network I/O — keep them off the loop.
    provider = await asyncio.to_thread(build_provider)
    weaviate = WeaviateService()
    await asyncio.to_thread(weaviate.connect)
    await asyncio.to_thread(
        weaviate.bootstrap_collection, provider.name, provider.dimension
    )

    app.state.embedding_provider = provider
    app.state.weaviate = weaviate
    try:
        yield
    finally:
        await asyncio.to_thread(weaviate.close)


app = FastAPI(
    title="Study Buddy API",
    root_path="/api",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(filters.router, prefix="/filters", tags=["filters"])
app.include_router(weaviate_routes.router, prefix="/weaviate", tags=["Admin/Weaviate"])


@app.get("/")
def read_root():
    return {"message": "Study Buddy API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}