import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Button,
} from 'study-buddy';

export function DeleteDocument() {
  return (
    <Dialog open modal={false}>
      <DialogContent
        showCloseButton={false}
        style={{
          position: 'static',
          inset: 'auto',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          transform: 'none',
          translate: 'none',
          width: 400,
          maxWidth: 'none',
          margin: 16,
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Delete “Linear Algebra — Lecture 7”?</DialogTitle>
          <DialogDescription>
            This permanently removes the document and its 24 pages of shared
            notes from the Mathematics 2 module. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
