import {
  Popover,
  PopoverContent,
  PopoverAnchor,
  Button,
  Label,
  Checkbox,
} from 'study-buddy';

export function FilterPopover() {
  return (
    <Popover open modal={false}>
      <PopoverAnchor />
      <PopoverContent
        align="start"
        sideOffset={0}
        style={{ position: 'static', transform: 'none', width: 288 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
              Filter documents
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'var(--muted-foreground)',
                margin: '2px 0 0',
              }}
            >
              Narrow the Browse results by type.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox id="f-pdf" defaultChecked />
              <Label htmlFor="f-pdf">Lecture notes (PDF)</Label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox id="f-slides" defaultChecked />
              <Label htmlFor="f-slides">Slides</Label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox id="f-exams" />
              <Label htmlFor="f-exams">Past exams</Label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button size="sm" variant="ghost">
              Reset
            </Button>
            <Button size="sm">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
