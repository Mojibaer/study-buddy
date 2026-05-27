import {AdminShell} from '@/components/admin/shell/AdminShell'

export default function AdminLayout({children}: { children: React.ReactNode }) {
    return <AdminShell>{children}</AdminShell>
}