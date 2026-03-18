import Link from 'next/link'
import { Folder, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FolderList({ items }) {
  return (
    <div className="border rounded-lg divide-y">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "hover:bg-accent transition-colors",
            "min-h-[52px]"
          )}
        >
          <Folder className="w-5 h-5 text-yellow-500 shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          {item.count !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({item.count})
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  )
}
