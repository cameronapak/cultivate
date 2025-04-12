import React, { useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { Layout } from './components/Layout'
import { useParams } from 'react-router-dom'
import { useQuery, getDocument, updateDocument } from 'wasp/client/operations'
import { BlockNoteEditor } from './components/custom/BlockNoteEditor'
import { Button } from './components/ui/button'
import { Pencil, Save } from 'lucide-react'
import { toast } from 'sonner'
import "./client/blocknote.css";

export function DocumentPage() {
  const { documentId } = useParams()
  const parsedDocumentId = parseInt(documentId || '0', 10)
  const { data: document, isLoading, error } = useQuery(getDocument, { documentId: parsedDocumentId })
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState<any>(null)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error.message}</div>
  if (!document) return null

  const handleSave = async () => {
    try {
      await updateDocument({
        id: document.id,
        title: document.title,
        content: content || document.content
      })
      setIsEditing(false)
      toast.success('Document updated successfully')
    } catch (error) {
      console.error('Failed to update document:', error)
      toast.error('Failed to update document')
    }
  }

  return (
    <Layout 
      breadcrumbItems={[
        { title: 'Docs', url: '/documents' },
        { title: document.title }
      ]}
    >
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-medium">{document.title}</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <BlockNoteEditor 
            editable={isEditing} 
            initialContent={document?.content || ""} 
            onChange={setContent}
          />
        </div>
      </div>
    </Layout>
  )
}
