'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Upload, Tag, type LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export function SearchFeatures() {
  const t = useTranslations()

  const features: Feature[] = [
    { icon: Search, title: t('features.semanticSearch'), description: t('features.semanticSearchDesc') },
    { icon: Upload, title: t('features.easyUpload'), description: t('features.easyUploadDesc') },
    { icon: Tag, title: t('features.smartFilters'), description: t('features.smartFiltersDesc') },
  ]

  return (
    <div className="text-center py-12 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="pt-6 text-center">
              <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
