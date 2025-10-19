import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          Study Buddy
        </Link>
        <Link href="/upload">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </Link>
      </div>
    </header>
  )
}