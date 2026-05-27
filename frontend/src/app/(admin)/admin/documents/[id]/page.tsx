import { DocumentDetailView } from '@/components/admin/documents/DocumentDetailView'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminDocumentDetailPage({ params }: PageProps) {
    const { id } = await params
    return <DocumentDetailView id={Number(id)} />
}