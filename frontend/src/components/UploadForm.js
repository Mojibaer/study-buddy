'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'vorlesung', label: 'Vorlesung' },
  { value: 'uebung', label: 'Übung' },
  { value: 'pruefung', label: 'Prüfung' },
  { value: 'zusammenfassung', label: 'Zusammenfassung' },
  { value: 'skript', label: 'Skript' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

const SEMESTERS = [
  'WS25', 'SS25', 'WS24', 'SS24', 'WS23', 'SS23',
  'WS22', 'SS22', 'WS21', 'SS21', 'WS20', 'SS20',
]

export function UploadForm({ onSuccess }) {
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [semester, setSemester] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['.pdf', '.docx', '.txt', '.md']
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()

      if (!allowedTypes.includes(ext)) {
        setError(`Dateityp ${ext} nicht erlaubt. Erlaubt: ${allowedTypes.join(', ')}`)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const clearFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Bitte eine Datei auswählen')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    if (subject) formData.append('subject', subject)
    if (semester) formData.append('semester', semester)
    if (tags) formData.append('tags', tags)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Upload fehlgeschlagen')
      }

      setFile(null)
      setCategory('')
      setSubject('')
      setSemester('')
      setTags('')
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Datei</Label>
        {file ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
            <span className="text-sm truncate flex-1">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Input
            id="file"
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
          />
        )}
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, TXT oder MD
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Fach</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="z.B. Mathematik 1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="semester">Semester</Label>
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger>
            <SelectValue placeholder="Semester wählen" />
          </SelectTrigger>
          <SelectContent>
            {SEMESTERS.map((sem) => (
              <SelectItem key={sem} value={sem}>
                {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="z.B. wichtig, klausurrelevant"
        />
        <p className="text-xs text-muted-foreground">
          Kommagetrennt
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading || !file}>
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Wird hochgeladen...' : 'Hochladen'}
      </Button>
    </form>
  )
}