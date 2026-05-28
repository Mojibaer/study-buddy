import {ProtectedRoute} from '@/components/auth/ProtectedRoute'
import {AdminShell} from '@/components/admin/shell/AdminShell'

export default function AdminLayout({children}: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requireRole="admin">
            <AdminShell>{children}</AdminShell>
        </ProtectedRoute>
    )
}