'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError, type SimilarDocument } from '@/api/client'
import { useFilters } from '@/hooks/useFilters'
import { ALLOWED_FILE_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface UploadFormProps {
  /** Called after at least one file uploaded. `close` is true only when the whole
   * batch succeeded, so the dialog can stay open to show blocked/failed files. */
  onSuccess?: (result: { close: boolean }) => void
}

type ItemStatus = 'pending' | 'uploading' | 'done' | 'error' | 'plagiarism' | 'rate_limited'

interface UploadItem {
  file: File
  status: ItemStatus
  error?: string
  similar?: SimilarDocument
}

function fileExt(name: string): string {
  return name.substring(name.lastIndexOf('.')).toLowerCase()
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations()

  const { filters, loading: filtersLoading, getSubjectsForSemester } = useFilters()
  const filteredSubjects = getSubjectsForSemester(semesterId)

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const next: UploadItem[] = []
    for (const file of Array.from(fileList)) {
      const ext = fileExt(file.name)
      if (!ALLOWED_FILE_TYPES.includes(ext as typeof ALLOWED_FILE_TYPES[number])) {
        setError(t('upload.errorFileType', { ext, allowed: ALLOWED_FILE_TYPES.join(', ') }))
        continue
      }
      next.push({ file, status: 'pending' })
    }
    if (next.length > 0) {
      setError(null)
      // De-dupe by name+size against what's already queued.
      setItems((prev) => {
        const seen = new Set(prev.map((i) => `${i.file.name}:${i.file.size}`))
        return [...prev, ...next.filter((i) => !seen.has(`${i.file.name}:${i.file.size}`))]
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = '' // allow re-selecting the same file
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSemesterChange = (value: string) => {
    setSemesterId(value)
    setSubjectId('')
  }

  const patchItem = (index: number, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const queue = items
      .map((it, index) => ({ it, index }))
      .filter(({ it }) =>
        it.status === 'pending' ||
        it.status === 'error' ||
        it.status === 'plagiarism' ||
        it.status === 'rate_limited',
      )

    if (queue.length === 0) { setError(t('upload.errorNoFile')); return }

    setLoading(true)
    setError(null)
    queue.forEach(({ index }) =>
      patchItem(index, { status: 'uploading', error: undefined, similar: undefined }),
    )

    let successCount = 0
    try {
      const res = await api.uploadDocumentsBulk(
        queue.map(({ it }) => it.file),
        { category_id: categoryId || null, subject_id: subjectId || null },
      )
      // Map each per-file result back onto its queue item by position — the
      // backend preserves order and returns one result per submitted file.
      res.results.forEach((r, n) => {
        const { index } = queue[n]
        if (r.status === 'uploaded') {
          patchItem(index, { status: 'done' })
          successCount++
        } else if (r.status === 'plagiarism') {
          patchItem(index, { status: 'plagiarism', similar: r.similar_document ?? undefined })
        } else if (r.status === 'rate_limited') {
          patchItem(index, { status: 'rate_limited', error: t('upload.statusRateLimited') })
        } else {
          patchItem(index, { status: 'error', error: r.message ?? t('upload.errorGeneric') })
        }
      })
    } catch (err) {
      // The whole request failed (network, rate limit on the single call, auth).
      const rateLimited = err instanceof ApiError && err.code === 'rate_limited'
      queue.forEach(({ index }) =>
        patchItem(index, {
          status: rateLimited ? 'rate_limited' : 'error',
          error: rateLimited ? t('upload.statusRateLimited') : (err as Error).message,
        }),
      )
    }

    setLoading(false)

    const failed = queue.length - successCount
    const allOk = successCount === queue.length

    // Clean run: toast + auto-close, no click needed. Partial run: keep the
    // dialog open so the user sees which files were blocked/failed.
    if (allOk) {
      toast.success(
        successCount === 1
          ? t('upload.toastSuccessOne')
          : t('upload.toastSuccessMany', { count: successCount }),
        { duration: 2000 },
      )
    } else if (successCount > 0) {
      toast.info(t('upload.toastPartial', { success: successCount, failed }), { duration: 2000 })
    }

    if (successCount > 0) onSuccess?.({ close: allOk })
  }

  if (filtersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  const pendingCount = items.filter(
    (i) =>
      i.status === 'pending' ||
      i.status === 'error' ||
      i.status === 'plagiarism' ||
      i.status === 'rate_limited',
  ).length
  const doneCount = items.filter((i) => i.status === 'done').length
  const failedCount = items.filter(
    (i) => i.status === 'error' || i.status === 'plagiarism' || i.status === 'rate_limited',
  ).length

  return (
    <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
      <div className="space-y-2">
        <Label htmlFor="file">{t('upload.file')}</Label>
        {items.length > 0 && (
          <ul className="space-y-1.5 max-h-56 overflow-y-auto">
            {items.map((item, index) => (
              <li
                key={`${item.file.name}:${item.file.size}`}
                className={cn(
                  'flex items-start gap-2 p-2 border rounded-md text-sm',
                  item.status === 'done' && 'border-green-600/40 bg-green-600/5',
                  (item.status === 'error' || item.status === 'plagiarism') && 'border-destructive/40 bg-destructive/5',
                  item.status === 'rate_limited' && 'border-amber-500/40 bg-amber-500/5',
                  (item.status === 'pending' || item.status === 'uploading') && 'bg-muted',
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {item.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {item.status === 'plagiarism' && <ShieldAlert className="w-4 h-4 text-destructive" />}
                  {item.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                  {item.status === 'rate_limited' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                  {item.status === 'pending' && <Upload className="w-4 h-4 text-muted-foreground" />}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.file.name}</span>
                  {item.status === 'plagiarism' && item.similar && (
                    <span className="block text-xs text-destructive">
                      {t('upload.statusPlagiarism', {
                        score: Math.round(item.similar.score * 100),
                        filename: item.similar.original_filename,
                      })}
                    </span>
                  )}
                  {item.status === 'error' && item.error && (
                    <span className="block text-xs text-destructive truncate">{item.error}</span>
                  )}
                  {item.status === 'rate_limited' && (
                    <span className="block text-xs text-amber-600">{t('upload.statusRateLimited')}</span>
                  )}
                </div>
                {!loading && (
                  <Button type="button" variant="ghost" size="sm" className="shrink-0 h-6 w-6 p-0" onClick={() => removeItem(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          disabled={loading}
          className="sr-only"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {items.length > 0 ? t('upload.addMore') : t('upload.choose')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('upload.fileTypes')}</p>
      </div>

      <div className="space-y-2">
        <Label>{t('upload.category')}</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger><SelectValue placeholder={t('upload.selectCategory')} /></SelectTrigger>
          <SelectContent className="duration-100">
            {filters.categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('upload.semester')}</Label>
        <Select value={semesterId} onValueChange={handleSemesterChange}>
          <SelectTrigger><SelectValue placeholder={t('upload.selectSemester')} /></SelectTrigger>
          <SelectContent className="duration-100">
            {filters.semesters.map((sem) => (
              <SelectItem key={sem.id} value={String(sem.id)}>{sem.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('upload.subject')}</Label>
        <Select value={subjectId} onValueChange={setSubjectId} disabled={!semesterId}>
          <SelectTrigger>
            <SelectValue placeholder={semesterId ? t('upload.selectSubject') : t('upload.selectSemesterFirst')} />
          </SelectTrigger>
          <SelectContent className="duration-100">
            {filteredSubjects.map((subj) => (
              <SelectItem key={subj.id} value={String(subj.id)}>{subj.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && (doneCount > 0 || failedCount > 0) && (
        <p className="text-sm text-muted-foreground">
          {doneCount > 0 && <span className="text-green-600">{t('upload.summarySuccess', { count: doneCount })}</span>}
          {doneCount > 0 && failedCount > 0 && ' · '}
          {failedCount > 0 && <span className="text-destructive">{t('upload.summaryFailed', { count: failedCount })}</span>}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading || pendingCount === 0}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {loading
          ? t('upload.uploading')
          : pendingCount > 1
            ? t('upload.submitCount', { count: pendingCount })
            : t('upload.submit')}
      </Button>
    </form>
  )
}
