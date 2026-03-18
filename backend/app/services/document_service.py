import io
import logging
from pypdf import PdfReader
from docx import Document

logger = logging.getLogger(__name__)

def extract_text_from_bytes(file_content: bytes, file_ext: str) -> str:
    """
    Extract text from different file types (from bytes)
    """
    try:
        if file_ext in [".txt", ".md"]:
            return file_content.decode("utf-8")

        elif file_ext == ".pdf":
            reader = PdfReader(io.BytesIO(file_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text

        elif file_ext == ".docx":
            doc = Document(io.BytesIO(file_content))
            return "\n".join([p.text for p in doc.paragraphs])

        else:
            return ""

    except Exception as e:
        logger.error("Error extracting text from file", exc_info=True)
        return ""