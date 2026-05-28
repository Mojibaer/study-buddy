import {AdminSidebar} from '@/components/admin/shell/AdminSidebar'
import {AdminTopbar} from '@/components/admin/shell/AdminTopbar'

export function AdminShell({children}: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar/>
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminTopbar/>
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    )
}