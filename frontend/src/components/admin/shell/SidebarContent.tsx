'use client'

import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {useTranslations} from 'next-intl'

import {cn} from '@/lib/utils'
import {adminNavigation, isAdminNavItemActive} from '@/components/admin/navigation'

interface SidebarContentProps {
    onNavigate?: () => void
}

export function SidebarContent({onNavigate}: SidebarContentProps) {
    const pathname = usePathname()
    const t = useTranslations('admin')

    return (
        <div className="flex h-full flex-col">
            <Link
                href="/admin"
                onClick={onNavigate}
                className="flex items-center gap-2 px-4 py-4 hover:opacity-80"
            >
                <Image src="/logo.svg" alt="StudyBuddy" width={28} height={26} priority/>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">{t('brand')}</span>
                    <span className="text-xs text-sidebar-foreground/60">{t('brandSubtitle')}</span>
                </div>
            </Link>

            <nav
                className="flex-1 px-2 pt-2 pb-4"
                aria-label={t('shell.navigationLabel')}
            >
                <ul className="flex flex-col gap-0.5">
                    {adminNavigation.map((item) => {
                        const Icon = item.icon
                        const active = isAdminNavItemActive(item, pathname)
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                                    )}
                                >
                                    <Icon className="size-4 shrink-0"/>
                                    <span>{t(`nav.${item.labelKey}`)}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}