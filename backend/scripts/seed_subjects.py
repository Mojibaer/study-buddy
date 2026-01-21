"""
Seed script for importing subjects from CSV into the database.
Usage: python seed_subjects.py
"""
import csv
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import Subject, Semester, SessionLocal


def seed_subjects(csv_path: str = "scripts/data/subjects.csv"):
    db = SessionLocal()

    try:
        # Check if semesters exist
        semesters = {s.id: s.name for s in db.query(Semester).all()}
        if not semesters:
            print("Error: No semesters found. Please create semesters first.")
            return

        print(f"Found semesters: {semesters}")

        # Read CSV and insert subjects
        added = 0
        skipped = 0

        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            for row in reader:
                name = row["name"].strip()
                semester_id = int(row["semester_id"])

                # Check if semester exists
                if semester_id not in semesters:
                    print(f"Warning: Semester {semester_id} not found, skipping '{name}'")
                    skipped += 1
                    continue

                # Check if subject already exists
                existing = db.query(Subject).filter_by(
                    name=name,
                    semester_id=semester_id
                ).first()

                if existing:
                    print(f"Skipping (exists): {name}")
                    skipped += 1
                    continue

                # Create new subject
                subject = Subject(name=name, semester_id=semester_id)
                db.add(subject)
                print(f"Added: {name} -> {semesters[semester_id]}")
                added += 1

        db.commit()
        print(f"\nDone! Added: {added}, Skipped: {skipped}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_subjects()