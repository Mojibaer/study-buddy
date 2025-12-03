from sqlalchemy import Column, Integer, String, DateTime, ARRAY, Text
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url  = Column(String, nullable=True)

    # Metadata
    category = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    tags = Column(ARRAY(String), default=[])

    # Content
    extracted_text = Column(Text, nullable=True)
    chroma_id = Column(String, unique=True, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())