# design-sync notes — Study Buddy UI

Repo-specific gotchas for future syncs of this design system.

## Build / packaging

- The DS is **not** a standalone package — it's the `ui/` component set inside the
  Next.js app (`frontend/`). The importable library build is a dedicated
  **tsup** step: `bun run build:lib` → `dist/index.mjs` (+ `dist/index.d.mts`).
  This is separate from `next build`; it touches neither Next, Tailwind runtime,
  nor app imports.
- `package.json` carries `module` / `types` / `exports` pointing at `dist/`.
  These were added specifically so the converter's `.d.ts` discovery
  (`findTypesRoot` → `package.json` `types`) finds the 92 exports. Without them
  the converter reports `[ZERO_MATCH]` (it does NOT fall back to `dist/*.d.mts`
  because its dir scan only matches `.d.ts`, not tsup's `.d.mts`). **Do not
  remove these fields.**
- Component list: 92 exports (18 top-level shadcn/ui components + their compound
  subparts like CardHeader, DialogContent, DropdownMenuItem…). shadcn exports
  subparts top-level (not as `Card.Header`), so they don't auto-group — all land
  in group `general`.

## Tailwind v4 — compiled CSS is a manual pre-step (RE-SYNC RISK)

- The app's `src/app/globals.css` is **Tailwind v4 source** (`@import "tailwindcss"`,
  `@theme inline`, `@plugin`). Feeding it to the converter directly fails
  `[CSS_IMPORT_MISSING]` — those are build-time directives, not real CSS.
- Fix: compile Tailwind against the ui components into a real stylesheet, then
  point `cfg.cssEntry` at the compiled file:
  ```
  bunx @tailwindcss/cli@4 -i src/app/globals.css \
    -o .design-sync/assets/ds-tailwind.css \
    --content "./src/components/ui/**/*.{ts,tsx}"
  ```
  `cfg.cssEntry = .design-sync/assets/ds-tailwind.css` (committed).
- **RE-SYNC RISK:** `ds-tailwind.css` is a generated snapshot. If component class
  usage or `globals.css` tokens change, **re-run the compile above before the
  converter**, or the synced styles go stale silently. The compile is NOT wired
  into the converter — it must be run by hand each sync.

## Fonts

- Brand fonts (Plus Jakarta Sans, Geist Mono) are served at runtime via
  `next/font/google` — no local `@font-face`. Suppressed via
  `cfg.runtimeFontPrefixes`. Designs render in these families only if the host
  app serves them; the bundle does not ship them.

## Previews — authoring notes (all 18 authored & graded good)

- No provider wrapper needed anywhere — DS tokens + fonts apply directly to
  bare-specifier `'study-buddy'` imports. Calibrated on Button/Card/Alert.
- Previews use inline `style={{…}}` only for layout glue (flex/gap/width) and
  `var(--…)` for DS color tokens.
- Icons: lucide-react is NOT exported from `'study-buddy'` — previews use
  text/emoji (🔍) for icon slots. Don't import lucide in a preview.

### Overlay components — the in-card render recipe (Dialog/Popover/Sheet/DropdownMenu)
Radix overlays render closed to a body portal. To capture them OPEN inside the card:
1. Force open on Root: `open modal={false}`.
2. On Content, neutralize portal/Popper positioning inline:
   `style={{ position:'static', transform:'none', inset:'auto', ... }}`.
3. Suppress teardown handlers: `onOpenAutoFocus`/`onEscapeKeyDown`/`onInteractOutside`
   → `e.preventDefault()`. NOTE: DropdownMenuContent has no `onOpenAutoFocus`
   (only `onCloseAutoFocus`) — passing it TS-errors.
4. `showCloseButton={false}` where the subpart renders an absolute close X.
- **DropdownMenu** also needs a visually-hidden `DropdownMenuTrigger` + `forceMount`
  on Content, else it mounts blank (no anchor).
- **Popover** needs a `PopoverAnchor` (even empty).
- **Select** open list won't render in-card; the closed trigger does — previews
  grade the trigger cells.
- **Dialog** (Tailwind v4 gotcha): `transform:none` alone does NOT undo the
  `-translate-x-1/2` centering — Tailwind v4 uses the modern `translate` CSS
  property. Must also set inline `translate: 'none'` (+ `inset:auto`) or the
  dialog renders clipped on the left. Fixed in Dialog.tsx.

### cardMode overrides applied (in cfg.overrides)
- Dialog/Sheet/DropdownMenu/Popover/Select → `cardMode: single` with viewports
  (overlays render uncliped in a roomy single-mode card).
- Table/Card/InputGroup/Separator/Textarea → `cardMode: column` (wide stories —
  one export per full-width row; resolves [GRID_OVERFLOW]).

### Known render warns (expected — not new issues on re-sync)
- `[RENDER_BLANK] PaginationEllipsis`: the ellipsis compound subpart renders blank
  in isolation by design — it's only meaningful inside the full Pagination
  composition (which is authored and graded good). Not a failure.
- `[GRID_OVERFLOW]` on Card/InputGroup/Separator/Textarea was resolved by the
  `cardMode: column` overrides above; column cards can't re-flag wide.

## Token semantics — `--input` is a BORDER token (fixed)

- shadcn/ui v4 uses `--input` as the **input border** color (`border-input`), NOT
  the input background. The repo originally set `--input: #FFFFFF` (light) /
  `#1B1929` (dark) — pure white/near-black — so input borders were invisible on
  card surfaces. Caught during sync preview review.
- Fixed in `src/app/globals.css`: `--input: #C9C5DE` (light) / `#3D3A56` (dark)
  — a visible grey slightly stronger than `--border`. This fix applies to the
  REAL app too, not just the previews.

## Re-sync risks (watch-list)

- `ds-tailwind.css` staleness (see Tailwind section) — the single biggest one.
- `package.json` `module`/`types`/`exports` must stay — removing them breaks
  component discovery.
- Previews authored from the app's own usage (login/register/setup pages, admin
  tables/dialogs) — if those app files change their composition, the previews
  don't auto-update; they're independent snapshots in `.design-sync/previews/`.
