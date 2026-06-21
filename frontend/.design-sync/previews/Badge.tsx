import { Badge } from 'study-buddy';

export function Variants() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Badge variant="default">PDF</Badge>
      <Badge variant="secondary">Indexed</Badge>
      <Badge variant="outline">Pending review</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  );
}

export function StatusTags() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Badge variant="secondary">Mathematics 2</Badge>
      <Badge variant="secondary">Lecture notes</Badge>
      <Badge variant="outline">24 pages</Badge>
      <Badge variant="default">New</Badge>
    </div>
  );
}
