import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { BrowseShell } from '@/components/browse/BrowseShell'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="p-8 text-center">...</div>}>
        <BrowseShell />
      </Suspense>
    </div>
  )
}
