'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useDocument } from '@/hooks/useDocument'
import { DocumentMetadata } from '@/components/document/DocumentMetadata'
import { FilePreview } from '@/components/document/FilePreview'
import { DocumentActions } from '@/components/document/DocumentActions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function DocumentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { document, loading, error } = useDocument(params.id)

    const handleBack = () => {
        router.back()
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zur Suche
                    </Button>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Fehler</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {document && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <FilePreview document={document} />
                            </div>

                            <div className="space-y-6">
                                <DocumentMetadata document={document} />
                                <DocumentActions document={document} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}