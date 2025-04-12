import React from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { Layout } from './components/Layout'
import { useParams } from 'react-router-dom'
import { useQuery, getDocument } from 'wasp/client/operations'
import { BlockNoteEditor } from './components/custom/BlockNoteEditor'
import "./client/blocknote.css";

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
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-medium">{document.title}</h1>
        <div className="mt-4">
          <BlockNoteEditor editable={false} initialContent={document?.content || ""} />
        </div>
      </div>
    </Layout>
  )
}
