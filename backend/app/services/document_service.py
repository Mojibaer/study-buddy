import os

def extract_text_from_file(file_path: str, file_ext: str) -> str:
    """
    Extract text from different file types
    """
    try:
        if file_ext == ".txt" or file_ext == ".md":
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()

        elif file_ext == ".pdf":
            # TODO: Implement PDF extraction (PyPDF2 or pdfplumber)
            return "PDF text extraction not yet implemented"

        elif file_ext == ".docx":
            # TODO: Implement DOCX extraction (python-docx)
            return "DOCX text extraction not yet implemented"

        else:
            return ""

    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""