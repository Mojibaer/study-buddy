import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from 'study-buddy';

export function DocumentCard() {
  return (
    <Card style={{ width: 380 }}>
      <CardHeader>
        <CardTitle>Linear Algebra — Lecture 7</CardTitle>
        <CardDescription>
          Eigenvalues, eigenvectors, and diagonalization. Uploaded by Hassan E.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">PDF</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          A 24-page summary covering the spectral theorem with worked examples
          from the SS26 problem sets. Tagged for the Mathematics 2 module.
        </p>
      </CardContent>
      <CardFooter style={{ display: 'flex', gap: 8 }}>
        <Button size="sm">Open</Button>
        <Button size="sm" variant="outline">Download</Button>
      </CardFooter>
    </Card>
  );
}

export function StatCard() {
  return (
    <Card style={{ width: 280 }}>
      <CardHeader>
        <CardDescription>Documents this week</CardDescription>
        <CardTitle style={{ fontSize: 32 }}>142</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
          +18% compared to last week across all modules.
        </p>
      </CardContent>
    </Card>
  );
}
