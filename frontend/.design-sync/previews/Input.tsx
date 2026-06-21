import { Input, Label } from 'study-buddy';

export function Placeholder() {
  return <Input placeholder="Search notes, modules, authors…" style={{ width: 320 }} />;
}

export function WithValue() {
  return <Input defaultValue="Linear Algebra — Lecture 7" style={{ width: 320 }} />;
}

export function Disabled() {
  return <Input defaultValue="student.id@fh-joanneum.at" disabled style={{ width: 320 }} />;
}

export function WithLabel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 320 }}>
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@fh-joanneum.at" />
    </div>
  );
}
