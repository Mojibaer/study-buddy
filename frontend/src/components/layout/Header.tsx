'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FolderOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadForm } from '@/components/UploadForm'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          Study Buddy
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Explore files - Desktop */}
          <Link href="/browse">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <FolderOpen className="w-4 h-4 mr-2" />
              Explore files
            </Button>
          </Link>

          {/* Explore files - Mobile */}
          <Link href="/browse">
            <Button variant="outline" size="icon" className="sm:hidden">
              <FolderOpen className="w-4 h-4" />
              <span className="sr-only">Explore files</span>
            </Button>
          </Link>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="sm:hidden">
                <Upload className="w-4 h-4" />
                <span className="sr-only">Upload</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dokument hochladen</DialogTitle>
              </DialogHeader>
              <UploadForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
