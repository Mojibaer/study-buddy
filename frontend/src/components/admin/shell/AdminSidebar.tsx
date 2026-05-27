import { SidebarContent } from '@/components/admin/shell/SidebarContent'

export function AdminSidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block">
            <SidebarContent />
        </aside>
    )
}