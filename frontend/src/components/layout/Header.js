'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadForm } from '@/components/UploadForm'
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          Study Buddy
        </Link>
          <div className="flex items-center gap-3">
          <ThemeToggle />
          </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Dokument hochladen</DialogTitle>
            </DialogHeader>
            <UploadForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}