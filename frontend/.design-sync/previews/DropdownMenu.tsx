import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from 'study-buddy';

export function RowActions() {
  return (
    <DropdownMenu open modal={false}>
      <DropdownMenuTrigger
        aria-label="Document actions"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      />
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={0}
        forceMount
        style={{ position: 'static', transform: 'none', width: 224 }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Document actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Download</DropdownMenuItem>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>
          Visible to module
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
