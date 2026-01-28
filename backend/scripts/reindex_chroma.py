import sys
sys.path.insert(0, '.')

from app.database.database import SessionLocal
from app.database.models import Document
from app.services.chroma_service import chroma_service
from app.services.document_service import extract_text_from_bytes
from app.services.minio_service import download_file

db = SessionLocal()
documents = db.query(Document).all()

print(f"Re-indexing {len(documents)} documents...\n")

success = 0
failed = 0

for doc in documents:
    try:
        file_content = download_file(doc.filename)

        extracted_text = extract_text_from_bytes(file_content, doc.file_type)
        if not extracted_text:
            print(f"⚠ {doc.original_filename} - No text extracted")
            failed += 1
            continue

        # Enrich text with metadata for better semantic search
        searchable_text = extracted_text
        if doc.subject:
            searchable_text += f" Fach: {doc.subject.name}"
        if doc.tags:
            searchable_text += f" Tags: {' '.join(doc.tags)}"

        category_name = doc.category.name if doc.category else ""
        subject_name = doc.subject.name if doc.subject else ""
        semester_name = doc.subject.semester.name if doc.subject and doc.subject.semester else ""
        tags_str = ",".join(doc.tags) if doc.tags else ""

        chroma_id = f"doc_{doc.id}"

        chroma_service.delete_document(chroma_id)
        chroma_service.add_document(
            doc_id=chroma_id,
            text=searchable_text,
            metadata={
                "document_id": doc.id,
                "filename": doc.original_filename,
                "category": category_name,
                "subject": subject_name,
                "semester": semester_name,
                "tags": tags_str
            }
        )

        print(f"✓ {doc.original_filename}")
        success += 1

    except Exception as e:
        print(f"✗ {doc.original_filename} - Error: {e}")
        failed += 1

db.close()
print(f"\nDone! {success} successful, {failed} failed")