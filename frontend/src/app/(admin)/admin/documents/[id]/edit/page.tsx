import { DocumentEditForm } from '@/components/admin/documents/DocumentEditForm'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminDocumentEditPage({ params }: PageProps) {
    const { id } = await params
    return <DocumentEditForm id={Number(id)} />
}