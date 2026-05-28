'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

export type StructureTab = 'semesters' | 'subjects' | 'categories'

const TABS: StructureTab[] = ['semesters', 'subjects', 'categories']

export function useActiveStructureTab(): StructureTab {
    const params = useSearchParams()
    const value = params.get('tab')
    return TABS.includes(value as StructureTab) ? (value as StructureTab) : 'semesters'
}

interface StructureTabsProps {
    active: StructureTab
}

export function StructureTabs({ active }: StructureTabsProps) {
    const t = useTranslations('admin.structure.tabs')

    return (
        <div
            className="inline-flex h-9 items-center gap-1 rounded-md bg-muted p-1 text-muted-foreground"
            role="tablist"
        >
            {TABS.map((tab) => {
                const isActive = tab === active
                return (
                    <Link
                        key={tab}
                        href={`/admin/categories?tab=${tab}`}
                        role="tab"
                        aria-selected={isActive}
                        className={cn(
                            'inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-background text-foreground shadow-sm'
                                : 'hover:text-foreground',
                        )}
                    >
                        {t(tab)}
                    </Link>
                )
            })}
        </div>
    )
}