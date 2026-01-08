import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Tag, Folder, BookOpen, HardDrive } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'

export function DocumentMetadata({ document }) {
    const metadataItems = [
        { icon: FileText, label: 'Dateiname', value: document.original_filename || document.filename },
        { icon: Folder, label: 'Kategorie', value: document.category?.name },
        { icon: BookOpen, label: 'Fach', value: document.subject?.name },
        { icon: Calendar, label: 'Semester', value: document.subject?.semester?.name },
        { icon: Calendar, label: 'Hochgeladen', value: document.created_at ? formatDate(document.created_at) : null },
        { icon: HardDrive, label: 'Dateigröße', value: document.file_size ? formatFileSize(document.file_size) : null },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dokument Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3">
                    {metadataItems.map((item, index) => {
                        if (!item.value) return null
                        const Icon = item.icon
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                                    <div className="text-sm break-words">{item.value}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {document.tags && document.tags.length > 0 && (
                    <div className="flex items-start gap-3 pt-2">
                        <Tag className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                            <div className="flex flex-wrap gap-1">
                                {document.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}