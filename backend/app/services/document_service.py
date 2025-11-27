def extract_text_from_bytes(file_content: bytes, file_ext: str) -> str:
    """
    Extract text from different file types (from bytes)
    """
    try:
        if file_ext in [".txt", ".md"]:
            return file_content.decode("utf-8")

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