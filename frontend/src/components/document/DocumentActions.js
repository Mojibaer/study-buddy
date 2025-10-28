'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Share2, Mail, MessageCircle, Link2, Check } from 'lucide-react'
import { shareViaWhatsApp, shareViaEmail, copyToClipboard } from '@/lib/utils'
import { useState } from 'react'

export function DocumentActions({ document }) {
    const [copied, setCopied] = useState(false)
    const documentUrl = typeof window !== 'undefined' ? window.location.href : ''
    const documentTitle = document.original_filename || document.filename

    const handleCopyLink = async () => {
        const success = await copyToClipboard(documentUrl)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownload = () => {
        if (document.file_url) {
            window.open(document.file_url, '_blank')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Aktionen
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    onClick={handleDownload}
                    disabled={!document.file_url}
                    className="w-full"
                    size="lg"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                </Button>

                <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-3">Teilen via</div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareViaWhatsApp(documentUrl, documentTitle)}
                            className="flex flex-col h-auto py-3"
                        >
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-xs">WhatsApp</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareViaEmail(documentUrl, documentTitle)}
                            className="flex flex-col h-auto py-3"
                        >
                            <Mail className="w-5 h-5 mb-1" />
                            <span className="text-xs">Email</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="flex flex-col h-auto py-3"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Kopiert!</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Link</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}