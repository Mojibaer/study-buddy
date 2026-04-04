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
import { api } from '@/api/client'
import { useFilters } from '@/hooks/useFilters'
import { ALLOWED_FILE_TYPES } from '@/lib/constants'

interface UploadFormProps {
  onSuccess?: () => void
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { filters, loading: filtersLoading, getSubjectsForSemester } = useFilters()
  const filteredSubjects = getSubjectsForSemester(semesterId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()

      if (!ALLOWED_FILE_TYPES.includes(ext as typeof ALLOWED_FILE_TYPES[number])) {
        setError(`Dateityp ${ext} nicht erlaubt. Erlaubt: ${ALLOWED_FILE_TYPES.join(', ')}`)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const clearFile = () => {
    setFile(null)
  }

  const handleSemesterChange = (value: string) => {
    setSemesterId(value)
    setSubjectId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Bitte eine Datei auswählen')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.uploadDocument(file, {
        category_id: categoryId || null,
        subject_id: subjectId || null,
        tags: tags || null,
      })

      setFile(null)
      setCategoryId('')
      setSubjectId('')
      setSemesterId('')
      setTags('')
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (filtersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
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
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent className="duration-100">
            {filters.categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="semester">Semester</Label>
        <Select value={semesterId} onValueChange={handleSemesterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Semester wählen" />
          </SelectTrigger>
          <SelectContent className="duration-100">
            {filters.semesters.map((sem) => (
              <SelectItem key={sem.id} value={String(sem.id)}>
                {sem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Fach</Label>
        <Select value={subjectId} onValueChange={setSubjectId} disabled={!semesterId}>
          <SelectTrigger>
            <SelectValue placeholder={semesterId ? "Fach wählen" : "Erst Semester wählen"} />
          </SelectTrigger>
          <SelectContent className="duration-100">
            {filteredSubjects.map((subj) => (
              <SelectItem key={subj.id} value={String(subj.id)}>
                {subj.name}
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
