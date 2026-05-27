import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.core.security import get_password_hash
from app.database.database import AsyncSessionLocal
from app.database.models import User, UserRole


async def main() -> None:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    username = os.environ.get("ADMIN_USERNAME", "admin")

    if not email or not password:
        sys.exit("ADMIN_EMAIL and ADMIN_PASSWORD are required")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email.lower()))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                email=email.lower(),
                username=username,
                password_hash=get_password_hash(password),
                role=UserRole.admin,
                is_active=True,
                email_verified_at=datetime.now(timezone.utc),
            )
            db.add(user)
            print(f"created admin {email}")
        else:
            user.role = UserRole.admin
            user.is_active = True
            if user.password_hash is None:
                user.password_hash = get_password_hash(password)
            if user.email_verified_at is None:
                user.email_verified_at = datetime.now(timezone.utc)
            print(f"promoted existing user {email} to admin")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())