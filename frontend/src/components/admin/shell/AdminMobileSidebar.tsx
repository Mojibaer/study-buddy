'use client'

import {Menu} from 'lucide-react'
import {useState} from 'react'
import {useTranslations} from 'next-intl'

import {Button} from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {SidebarContent} from '@/components/admin/shell/SidebarContent'

export function AdminMobileSidebar() {
    const [open, setOpen] = useState(false)
    const t = useTranslations('admin.shell')

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('openNavigation')}>
                    <Menu className="size-5"/>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                showCloseButton={false}
                className="w-64 bg-sidebar p-0 text-sidebar-foreground"
            >
                <SheetTitle className="sr-only">{t('navigationLabel')}</SheetTitle>
                <SheetDescription className="sr-only">{t('navigationDescription')}</SheetDescription>
                <SidebarContent onNavigate={() => setOpen(false)}/>
            </SheetContent>
        </Sheet>
    )
}