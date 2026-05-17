import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="admin">
      <div className="min-h-screen flex">
        <aside className="w-64 border-r bg-muted/40 p-6 flex flex-col gap-2">
          <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Admin
          </span>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
