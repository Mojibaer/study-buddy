from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Document, Subject, Category, Semester
from app.services.chroma_service import chroma_service

router = APIRouter()


@router.get("/semantic")
def semantic_search(
    query: str = Query(..., min_length=1),
    category_id: int | None = None,
    subject_id: int | None = None,
    semester_id: int | None = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
) -> dict:
    where_conditions: list[dict] = []

    if category_id:
        category = db.query(Category).filter(Category.id == category_id).first()
        if category:
            where_conditions.append({"category": category.name})

    if subject_id:
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if subject:
            where_conditions.append({"subject": subject.name})

    if semester_id:
        semester = db.query(Semester).filter(Semester.id == semester_id).first()
        if semester:
            where_conditions.append({"semester": semester.name})

    where_filter: dict | None = None
    if len(where_conditions) == 1:
        where_filter = where_conditions[0]
    elif len(where_conditions) > 1:
        where_filter = {"$and": where_conditions}

    chroma_results = chroma_service.search(
        query=query,
        n_results=limit,
        filter_dict=where_filter
    )

    if not chroma_results['ids'] or not chroma_results['ids'][0]:
        return {"results": [], "query": query, "total_results": 0}

    doc_ids: list[int] = [
        int(metadata['document_id'])
        for metadata in chroma_results['metadatas'][0]
    ]

    documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()

    results = []
    for i, doc_id in enumerate(doc_ids):
        doc = next((d for d in documents if d.id == doc_id), None)
        if doc:
            results.append({
                "document": {
                    "id": doc.id,
                    "filename": doc.filename,
                    "original_filename": doc.original_filename,
                    "file_type": doc.file_type,
                    "file_size": doc.file_size,
                    "file_url": doc.file_url,
                    "category": {"id": doc.category.id, "name": doc.category.name} if doc.category else None,
                    "subject": {
                        "id": doc.subject.id,
                        "name": doc.subject.name,
                        "semester": {
                            "id": doc.subject.semester.id,
                            "name": doc.subject.semester.name
                        } if doc.subject.semester else None
                    } if doc.subject else None,
                    "tags": doc.tags
                },
                "distance": chroma_results['distances'][0][i],
                "snippet": chroma_results['documents'][0][i][:200] + "..." if chroma_results['documents'][0][i] else ""
            })

    return {
        "query": query,
        "total_results": len(results),
        "results": results
    }
