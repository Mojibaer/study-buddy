import redis.asyncio as aioredis

from app.core.config import settings

redis_client: aioredis.Redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

JTI_DENYLIST_PREFIX = "jti:blocked:"
VERIFY_TOKEN_PREFIX = "verify:"
VERIFY_TOKEN_TTL = 86400  # 24h


async def denylist_token(jti: str, ttl_seconds: int) -> None:
    await redis_client.setex(f"{JTI_DENYLIST_PREFIX}{jti}", ttl_seconds, "1")


async def is_token_denied(jti: str) -> bool:
    return await redis_client.exists(f"{JTI_DENYLIST_PREFIX}{jti}") == 1


async def store_verify_token(token: str, user_id: int) -> None:
    await redis_client.setex(f"{VERIFY_TOKEN_PREFIX}{token}", VERIFY_TOKEN_TTL, str(user_id))


async def consume_verify_token(token: str) -> int | None:
    key = f"{VERIFY_TOKEN_PREFIX}{token}"
    value = await redis_client.getdel(key)
    return int(value) if value is not None else None
