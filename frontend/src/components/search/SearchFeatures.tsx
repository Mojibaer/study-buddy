import { getTranslations } from 'next-intl/server'
import { Search, Upload, SlidersHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FEATURE_CONFIG = [
  { icon: Search, titleKey: 'features.semanticSearch', descKey: 'features.semanticSearchDesc' },
  { icon: Upload, titleKey: 'features.easyUpload', descKey: 'features.easyUploadDesc' },
  { icon: SlidersHorizontal, titleKey: 'features.smartFilters', descKey: 'features.smartFiltersDesc' },
] as const

export async function SearchFeatures() {
  const t = await getTranslations()

  const features: { icon: LucideIcon; title: string; description: string }[] = FEATURE_CONFIG.map((f) => ({
    icon: f.icon,
    title: t(f.titleKey),
    description: t(f.descKey),
  }))

  return (
    <div className="border-t border-border pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature) => (
        <div key={feature.title} className="flex flex-col items-center text-center gap-2 md:flex-row md:items-start md:text-left md:gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
            <feature.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
