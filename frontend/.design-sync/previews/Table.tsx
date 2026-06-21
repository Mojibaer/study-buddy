import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Badge,
} from 'study-buddy';

export function DocumentsTable() {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <Table>
        <TableCaption>Recently uploaded study notes across your modules.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Status</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell style={{ fontWeight: 500 }}>Linear Algebra L7</TableCell>
            <TableCell>Math 2</TableCell>
            <TableCell>
              <Badge variant="secondary">Indexed</Badge>
            </TableCell>
            <TableCell style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>
              2d ago
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ fontWeight: 500 }}>Thermodynamics Summary</TableCell>
            <TableCell>Physics 1</TableCell>
            <TableCell>
              <Badge variant="outline">Pending</Badge>
            </TableCell>
            <TableCell style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>
              5h ago
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ fontWeight: 500 }}>Graph Theory Cheatsheet</TableCell>
            <TableCell>Discrete Math</TableCell>
            <TableCell>
              <Badge variant="secondary">Indexed</Badge>
            </TableCell>
            <TableCell style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>
              1w ago
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={{ fontWeight: 500 }}>OOP Lab Report 3</TableCell>
            <TableCell>Programming 2</TableCell>
            <TableCell>
              <Badge variant="destructive">Failed</Badge>
            </TableCell>
            <TableCell style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>
              Just now
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total documents</TableCell>
            <TableCell style={{ textAlign: 'right' }}>4</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
