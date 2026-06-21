import { Textarea, Label } from 'study-buddy';

export function Placeholder() {
  return (
    <Textarea
      placeholder="Describe what these notes cover so others can find them…"
      style={{ width: 360 }}
    />
  );
}

export function WithValue() {
  return (
    <Textarea
      defaultValue={
        'A 24-page summary covering the spectral theorem with worked examples.\n\n' +
        'Includes the SS26 problem sets for Mathematics 2 and a cheat sheet for the final exam.'
      }
      rows={5}
      style={{ width: 360 }}
    />
  );
}

export function Disabled() {
  return (
    <Textarea
      defaultValue="This document is locked while indexing completes."
      disabled
      style={{ width: 360 }}
    />
  );
}

export function WithLabel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 360 }}>
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Add a short summary of your notes…" />
    </div>
  );
}
