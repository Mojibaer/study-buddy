import {
    Activity,
    FileText,
    FolderTree,
    LayoutDashboard,
    Users,
    type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
    href: string
    labelKey: string
    icon: LucideIcon
    exact?: boolean
}

export const adminNavigation: readonly AdminNavItem[] = [
    {href: '/admin', labelKey: 'dashboard', icon: LayoutDashboard, exact: true},
    {href: '/admin/users', labelKey: 'users', icon: Users},
    {href: '/admin/documents', labelKey: 'documents', icon: FileText},
    {href: '/admin/categories', labelKey: 'categories', icon: FolderTree},
    {href: '/admin/settings', labelKey: 'system', icon: Activity},
] as const

export function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
}