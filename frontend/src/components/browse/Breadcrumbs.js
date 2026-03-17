import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-1 shrink-0">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          {index === items.length - 1 ? (
            <span className="font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
