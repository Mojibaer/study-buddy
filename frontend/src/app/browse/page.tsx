import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import BrowseContent from './BrowseContent'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="p-8 text-center">Lade...</div>}>
        <BrowseContent />
      </Suspense>
    </div>
  )
}
