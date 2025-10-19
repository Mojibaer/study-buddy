import { Card, CardContent } from '@/components/ui/card'
import { Search, Upload, Tag } from 'lucide-react'

export function SearchFeatures() {
  const features = [
    {
      icon: Search,
      title: 'Semantic Search',
      description: 'Suche nach Konzepten, nicht nur Keywords',
    },
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'PDF, DOCX, TXT, MD unterstützt',
    },
    {
      icon: Tag,
      title: 'Smart Filters',
      description: 'Nach Kategorie, Fach, Semester filtern',
    },
  ]

  return (
    <div className="text-center py-12 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}