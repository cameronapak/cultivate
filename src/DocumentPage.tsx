import { Layout } from './components/Layout'
import { useParams } from 'react-router-dom'
import { useQuery, getDocument } from 'wasp/client/operations'
import { Document } from 'wasp/entities'

export function DocumentPage() {
  const { documentId } = useParams()
  const parsedDocumentId = parseInt(documentId || '0', 10)

  const { data: document, isLoading, error } = useQuery(getDocument, { documentId: parsedDocumentId })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!document) return null

  return (
    <Layout 
      breadcrumbItems={[
        { title: 'Documents', url: '/documents' },
        { title: document.title }
      ]}
    >
      <div className="prose max-w-none">
        <h1>{document.title}</h1>
        <div className="mt-4">
          {document.content}
        </div>
      </div>
    </Layout>
  )
}
