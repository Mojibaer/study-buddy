# Study Buddy UI — how to build with this design system

A shadcn/ui-based React component set (Radix primitives) styled with **Tailwind CSS v4**
and semantic CSS-variable tokens. Components are imported from the bundle global and
styled with Tailwind utility classes that map onto the design tokens below.

## Setup & wrapping

No provider or theme wrapper is required — tokens and fonts apply globally from the
stylesheet. Just import a component and render it. Dark mode is opt-in: add `class="dark"`
to an ancestor (e.g. `<html class="dark">`) and every token flips to its dark value.

Fonts are **Plus Jakarta Sans** (sans, the default UI font) and **Geist Mono** (mono).
They load at runtime via the host app — designs should assume these families are present.

## Styling idiom — Tailwind utilities over semantic tokens

Style with Tailwind v4 utility classes. **Always use the semantic token utilities, never
raw colors** (`bg-primary`, not `bg-indigo-600`) — this is what keeps designs on-brand and
dark-mode-correct. The token vocabulary (each has a `-foreground` pair for text on it):

| Surface / intent | utilities |
|---|---|
| Page          | `bg-background` `text-foreground` |
| Primary action| `bg-primary` `text-primary-foreground` |
| Secondary     | `bg-secondary` `text-secondary-foreground` |
| Muted / subtle| `bg-muted` `text-muted-foreground` |
| Accent (hover)| `bg-accent` `text-accent-foreground` |
| Card surface  | `bg-card` `text-card-foreground` |
| Popover surface| `bg-popover` `text-popover-foreground` |
| Destructive   | `bg-destructive` (red, for delete/danger) |
| Borders/inputs| `border` `border-input` `ring` (focus) |

Radius: `rounded-md` / `rounded-lg` derive from the `--radius` token. Spacing/typography
use standard Tailwind scale (`gap-2`, `p-4`, `text-sm`, `font-medium`).

Component variant props carry the design language — prefer them over restyling:
- `Button` — `variant`: default · secondary · outline · ghost · destructive · link;
  `size`: default · sm · lg · icon.
- `Badge` — `variant`: default · secondary · outline · destructive.
- `Alert` — `variant`: default · destructive.

## Compound components

Card, Dialog, Select, Table, DropdownMenu, Popover, Sheet, Pagination, InputGroup and
Avatar are **compound** — compose their subparts (e.g. `Card` + `CardHeader` + `CardTitle`
+ `CardContent` + `CardFooter`; `Table` + `TableHeader` + `TableRow` + `TableCell`). Each
subpart is its own export. Read the per-component `<Name>.prompt.md` for the subpart set
and a usage example before composing.

## Where the truth lives

- `_ds_bundle.css` / `styles.css` — the compiled token definitions and component styles.
- `components/<group>/<Name>/<Name>.d.ts` — the prop contract per component.
- `components/<group>/<Name>/<Name>.prompt.md` — usage reference per component.

## Idiomatic example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from 'study-buddy';

<Card className="w-96">
  <CardHeader>
    <CardTitle>Linear Algebra — Lecture 7</CardTitle>
    <CardDescription className="text-muted-foreground">Eigenvalues & diagonalization</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge variant="secondary">PDF</Badge>
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button>Open</Button>
    <Button variant="outline">Download</Button>
  </CardFooter>
</Card>
```
