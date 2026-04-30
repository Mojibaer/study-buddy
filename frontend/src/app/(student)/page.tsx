import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchPage } from '@/components/search/SearchPage'
import { SearchFeatures } from '@/components/search/SearchFeatures'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <SearchPage featuresSlot={<SearchFeatures />} />
      <Footer />
    </div>
  )
}
