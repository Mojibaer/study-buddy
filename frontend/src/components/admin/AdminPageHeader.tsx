import {cn} from '@/lib/utils'

interface AdminPageHeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
    className?: string
}

export function AdminPageHeader({title, subtitle, actions, className}: AdminPageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}