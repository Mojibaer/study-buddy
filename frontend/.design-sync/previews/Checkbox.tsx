import { Checkbox, Label } from 'study-buddy';

export function Unchecked() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  );
}

export function Checked() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox id="emails" defaultChecked />
      <Label htmlFor="emails">Email me about new uploads</Label>
    </div>
  );
}

export function Indeterminate() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox id="modules" indeterminate />
      <Label htmlFor="modules">Select all modules</Label>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Checkbox id="archived" defaultChecked disabled />
      <Label htmlFor="archived">Include archived semesters</Label>
    </div>
  );
}
