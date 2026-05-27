import {AdminMobileSidebar} from '@/components/admin/shell/AdminMobileSidebar'
import {UserPreferencesMenu} from '@/components/layout/UserPreferencesMenu'

export function AdminTopbar() {
    return (
        <header
            className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
            <AdminMobileSidebar/>
            <div className="ml-auto">
                <UserPreferencesMenu/>
            </div>
        </header>
    )
}