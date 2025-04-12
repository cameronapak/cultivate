import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import {
  useQuery,
  getDocument,
  updateDocument,
  deleteDocument,
} from "wasp/client/operations";
import { BlockNoteEditor } from "../components/custom/BlockNoteEditor";
import { Button } from "../components/ui/button";
import { BadgeCheck, BadgeX, Pencil, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import "../client/blocknote.css";
import { Badge } from "../components/ui/badge";

export function DocumentPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const parsedDocumentId = parseInt(documentId || "0", 10);
  const {
    data: document,
    isLoading,
    error,
  } = useQuery(getDocument, { documentId: parsedDocumentId });
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!document) return null;

  const handleSave = async () => {
    try {
      await updateDocument({
        id: document.id,
        title: document.title,
        content: content || document.content,
      });
      setIsEditing(false);
      toast.success("Document updated successfully");
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument({ id: document.id });
      navigate("/documents");
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleUpdatePublishedStatus = async (published: boolean) => {
    try {
      if (window.confirm("Are you sure you want to " + (published ? "publish" : "unpublish") + " this document?")) {
        await updateDocument({
          id: document.id,
          title: document.title,
          content: document.content,
          isPublished: published,
        });
        toast.success("Document " + (published ? "published" : "unpublished") + " successfully");
      }
    } catch (error) {
      console.error("Failed to " + (published ? "publish" : "unpublish") + " document:", error);
      toast.error("Failed to " + (published ? "publish" : "unpublish") + " document");
    }
  };

  return (
    <Layout
      breadcrumbItems={[
        { title: "Docs", url: "/documents" },
        { title: document.title },
      ]}
    >
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-medium flex items-center gap-2">
            {document.title}
            {document.isPublished ? (
              <BadgeCheck className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Badge variant="secondary" className="text-muted-foreground font-normal">
                Draft
              </Badge>
            )}
          </h1>
          <div className="flex gap-2">
            {isEditing ? (
              <Button size="default" onClick={handleSave}>
                <Save className="w-4 h-4" />
                Save
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {document.isPublished ? (
                  <Button className="hover:text-destructive" size="icon" variant="outline" onClick={() => handleUpdatePublishedStatus(false)}>
                    <BadgeX className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="icon" variant="outline" onClick={() => handleUpdatePublishedStatus(true)}>
                    <BadgeCheck className="w-4 h-4" />
                  </Button>
                )}
              </div>
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
