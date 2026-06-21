import { Alert, AlertTitle, AlertDescription } from 'study-buddy';

export function Default() {
  return (
    <Alert style={{ maxWidth: 460 }}>
      <AlertTitle>Document uploaded</AlertTitle>
      <AlertDescription>
        Your notes are being processed and will appear in Browse within a few
        minutes once indexing completes.
      </AlertDescription>
    </Alert>
  );
}

export function Destructive() {
  return (
    <Alert variant="destructive" style={{ maxWidth: 460 }}>
      <AlertTitle>Upload failed</AlertTitle>
      <AlertDescription>
        The file exceeds the 25&nbsp;MB limit. Compress the PDF or split it into
        separate documents and try again.
      </AlertDescription>
    </Alert>
  );
}
