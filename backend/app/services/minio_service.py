import logging
import os
from minio import Minio

logger = logging.getLogger(__name__)
from minio.error import S3Error
from datetime import timedelta
import uuid

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "test-documents")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000")

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)

def get_file_url(object_key: str) -> str:
    return f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{object_key}"

def ensure_bucket_exists():
    """Create bucket if it doesn't exist."""
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
    except S3Error as e:
        raise Exception(f"MinIO bucket error: {e}")


def upload_file(file_data: bytes, original_filename: str, content_type: str) -> str:
    """
    Upload file to MinIO.
    Returns the object key (path in bucket).
    """
    from io import BytesIO

    ensure_bucket_exists()

    # Generate unique filename
    file_extension = os.path.splitext(original_filename)[1]
    object_key = f"{uuid.uuid4()}{file_extension}"

    try:
        minio_client.put_object(
            bucket_name=MINIO_BUCKET,
            object_name=object_key,
            data=BytesIO(file_data),
            length=len(file_data),
            content_type=content_type
        )
        return object_key
    except S3Error as e:
        raise Exception(f"MinIO upload error: {e}")


def get_presigned_url(object_key: str, expires_hours: int = 1) -> str:
    """
    Generate a presigned URL for temporary file access.
    """
    try:
        url = minio_client.presigned_get_object(
            bucket_name=MINIO_BUCKET,
            object_name=object_key,
            expires=timedelta(hours=expires_hours)
        )
        internal_url = f"{'https' if MINIO_SECURE else 'http'}://{MINIO_ENDPOINT}"
        url = url.replace(internal_url, MINIO_PUBLIC_URL)
        return url
    except S3Error as e:
        raise Exception(f"MinIO presigned URL error: {e}")


def download_file(object_key: str) -> bytes:
    """
    Download file from MinIO.
    Returns file content as bytes.
    """
    try:
        response = minio_client.get_object(MINIO_BUCKET, object_key)
        data = response.read()
        response.close()
        response.release_conn()
        return data
    except S3Error as e:
        raise Exception(f"MinIO download error: {e}")


def delete_file(object_key: str) -> bool:
    try:
        minio_client.remove_object(MINIO_BUCKET, object_key)
        return True
    except S3Error as e:
        raise Exception(f"MinIO delete error: {e}")