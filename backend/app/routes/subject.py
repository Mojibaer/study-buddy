
    

    MATHE1 = "Mathematics 1"
    BIGDATA = "Big Data"

    WS24 = "WS 2024"

#alle fächer definieren
#datenbank struktur für fächer zu semester relation -> extra tabelle für fächer oder mit tabelle documents genug

@router.post("/add", response_model=DocumentResponse)
async def add_subject(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    semester: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a document with metadata
    """
    allowed_extensions = {".pdf", ".docx", ".txt", ".md"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {allowed_extensions}"
        )

    file_content = await file.read()
    file_size = len(file_content)

    # Upload to MinIO
    object_key = upload_file(
        file_data=file_content,
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream"
    )

    extracted_text = extract_text_from_bytes(file_content, file_ext)

    tag_list = [tag.strip() for tag in tags.split(",")] if tags else []

    db_document = Document(
        filename=object_key,
        original_filename=file.filename,
        file_type=file_ext,
        file_size=file_size,
        file_url=get_file_url(object_key),
        category=category,
        subject=subject,
        semester=semester,
        tags=tag_list,
        extracted_text=extracted_text
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Add to ChromaDB (if text exists)
    if extracted_text:
        chroma_id = f"doc_{db_document.id}"
        chroma_service.add_document(
            doc_id=chroma_id,
            text=extracted_text,
            metadata={
                "document_id": db_document.id,
                "filename": file.filename,
                "category": category or "uncategorized",
                "subject": subject or "",
                "semester": semester or "",
                "tags": ",".join(tag_list)
            }
        )
        db_document.chroma_id = chroma_id
        db.commit()

    return db_document