import { Label, Input, Checkbox } from 'study-buddy';

export function WithInput() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
      <Label htmlFor="module">Module name</Label>
      <Input id="module" placeholder="e.g. Mathematics 2" />
    </div>
  );
}

export function WithCheckbox() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox id="public" defaultChecked />
      <Label htmlFor="public">Make these notes public</Label>
    </div>
  );
}
