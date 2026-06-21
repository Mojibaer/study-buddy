import { Separator } from 'study-buddy';

export function Horizontal() {
  return (
    <div style={{ width: 360 }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Linear Algebra — Lecture 7</p>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
          Eigenvalues, eigenvectors, and diagonalization.
        </p>
      </div>
      <Separator style={{ margin: '16px 0' }} />
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Mathematics 2 — Tutorial</p>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
          Worked solutions for the SS26 problem sets.
        </p>
      </div>
    </div>
  );
}

export function Vertical() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 24, fontSize: 14 }}>
      <span>24 pages</span>
      <Separator orientation="vertical" />
      <span>PDF</span>
      <Separator orientation="vertical" />
      <span>Uploaded by Hassan E.</span>
    </div>
  );
}
