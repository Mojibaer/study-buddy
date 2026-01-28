import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Tag, ExternalLink } from 'lucide-react'

export function SearchResults({ results }) {
  if (!results) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {results.total_results} Ergebnisse für &quot;{results.query}&quot;
        </h3>
      </div>

      {results.results.length === 0 ? (
        <EmptyResults />
      ) : (
        <div className="grid gap-4">
          {results.results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyResults() {
  return (
    <Card>
      <CardContent className="pt-6 text-center text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Keine Ergebnisse gefunden.</p>
        <p className="text-sm mt-2">
          Versuche andere Suchbegriffe oder lade neue Dokumente hoch.
        </p>
      </CardContent>
    </Card>
  )
}

function ResultCard({ result }) {
  const { document } = result

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {document.original_filename || document.filename}
            </CardTitle>
            <CardDescription className="mt-1">
              Match Score: {((1 - result.distance) * 100).toFixed(1)}%
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <DocumentMetadata document={document} />

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Link href={`/documents/${document.id}`}>
          <Button variant="outline" className="w-full mt-2">
            Details anzeigen
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function DocumentMetadata({ document }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      {document.category?.name && (
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>{document.category.name}</span>
        </div>
      )}
      {document.subject?.name && (
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          <span>{document.subject.name}</span>
        </div>
      )}
      {document.subject?.semester?.name && (
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{document.subject.semester.name}</span>
        </div>
      )}
    </div>
  )
}