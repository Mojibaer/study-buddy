import { Button } from 'study-buddy';

export function Variants() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="default">Upload notes</Button>
      <Button variant="secondary">Browse</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="destructive">Delete document</Button>
      <Button variant="link">Learn more</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">+</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button disabled>Saving…</Button>
      <Button variant="outline" disabled>Unavailable</Button>
    </div>
  );
}
