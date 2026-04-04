import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, AlertCircle } from 'lucide-react'
import { getFileViewerUrl } from '@/lib/utils'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Document } from '@/types'

interface FilePreviewProps {
  document: Document
}

interface TextFilePreviewProps {
  fileUrl: string
  onError: () => void
  isMarkdown: boolean
}

export function FilePreview({ document }: FilePreviewProps) {
  const [error, setError] = useState(false)
  const fileUrl = document.file_url
  const fileName = document.original_filename || document.filename || ''
  const fileExtension = fileName.split('.').pop()?.toLowerCase()

  const viewerUrl = fileUrl ? getFileViewerUrl(fileUrl, fileExtension) : null

  const handleIframeError = () => {
    setError(true)
  }

  if (!fileUrl) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Datei-URL nicht verfügbar
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vorschau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vorschau konnte nicht geladen werden. Bitte verwenden Sie den Download-Button.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (fileExtension === 'txt' || fileExtension === 'md') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vorschau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextFilePreview
            fileUrl={fileUrl}
            onError={handleIframeError}
            isMarkdown={fileExtension === 'md'}
          />
        </CardContent>
      </Card>
    )
  }

  if (viewerUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Vorschau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] border rounded-lg overflow-hidden">
            <iframe
              src={viewerUrl}
              className="w-full h-full"
              onError={handleIframeError}
              title="Document Preview"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Vorschau
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Vorschau für diesen Dateityp nicht verfügbar. Bitte verwenden Sie den Download-Button.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function TextFilePreview({ fileUrl, onError, isMarkdown }: TextFilePreviewProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        onError()
      })
  }, [fileUrl, onError])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Vorschau...</div>
  }

  if (isMarkdown) {
    return (
      <div className="w-full max-h-[600px] overflow-auto p-4 prose prose-slate prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-code:bg-muted prose-code:px-1 prose-code:rounded">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="w-full max-h-[600px] overflow-auto">
      <pre className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-lg">
        {content}
      </pre>
    </div>
  )
}
