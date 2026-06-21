import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
  InputGroupTextarea,
} from 'study-buddy';

export function SearchNotes() {
  return (
    <div style={{ width: 360 }}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>🔍</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search notes, modules, authors…" />
      </InputGroup>
    </div>
  );
}

export function ShareLink() {
  return (
    <div style={{ width: 360 }}>
      <InputGroup>
        <InputGroupInput defaultValue="studybuddy.app/d/math2-l7" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function AddSummary() {
  return (
    <div style={{ width: 360 }}>
      <InputGroup>
        <InputGroupTextarea placeholder="Add a short summary for these lecture notes…" />
        <InputGroupAddon align="block-end">
          <InputGroupText>0 / 280</InputGroupText>
          <InputGroupButton>Save</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
