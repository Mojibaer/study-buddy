import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  Button,
  Separator,
  Badge,
} from 'study-buddy';

export function DocumentDetails() {
  return (
    <Sheet open modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          position: 'static',
          inset: 'auto',
          height: 420,
          width: 360,
          maxWidth: 'none',
          transform: 'none',
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Linear Algebra — Lecture 7</SheetTitle>
          <SheetDescription>
            Details and sharing settings for this document.
          </SheetDescription>
        </SheetHeader>
        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Module</span>
            <span>Mathematics 2</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Uploaded by</span>
            <span>Hassan E.</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Pages</span>
            <span>24</span>
          </div>
          <Separator />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge variant="secondary">PDF</Badge>
            <Badge variant="secondary">Eigenvalues</Badge>
            <Badge variant="secondary">SS26</Badge>
          </div>
        </div>
        <div
          style={{
            marginTop: 'auto',
            padding: 16,
            display: 'flex',
            gap: 8,
          }}
        >
          <Button size="sm" style={{ flex: 1 }}>
            Download
          </Button>
          <SheetClose asChild>
            <Button size="sm" variant="outline">
              Close
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
