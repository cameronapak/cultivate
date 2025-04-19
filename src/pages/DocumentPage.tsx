import React, { useState, useEffect } from "react";
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
import { BadgeCheck, BadgeX, Pencil, Save, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import "../client/blocknote.css";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Skeleton } from "../components/ui/skeleton";

function DeleteDocumentWithAlertDialog({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const handleDelete = async () => {
    try {
      await deleteDocument({ id: id });
      navigate("/documents");
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PublishDocumentWithAlertDialog({
  id,
  title,
  content,
  isPublished,
  children,
}: {
  id: string;
  title: string;
  content: any;
  isPublished: boolean;
  children: React.ReactNode;
}) {
  const handlePublish = async () => {
    try {
      await updateDocument({
        id,
        title,
        content,
        isPublished: !isPublished,
      });
      toast.success(
        `Document ${isPublished ? "unpublished" : "published"} successfully`
      );
    } catch (error) {
      console.error(
        `Failed to ${isPublished ? "unpublish" : "publish"} document:`,
        error
      );
      toast.error(
        `Failed to ${isPublished ? "unpublish" : "publish"} document`
      );
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPublished ? "Unpublish Document" : "Publish Document"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {isPublished ? "unpublish" : "publish"}{" "}
            this document?
            {isPublished
              ? " Unpublish puts it back in draft mode."
              : " Publishing shows that the document is completed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={
              isPublished
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
            onClick={handlePublish}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DocumentPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  if (!documentId) {
    return navigate("/documents");
  }

  const {
    data: document,
    isLoading,
    error,
  } = useQuery(getDocument, { documentId });
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  React.useEffect(() => {
    setTitle(document?.title || "");
  }, [document]);

  // Add beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Update hasUnsavedChanges when content or title changes
  useEffect(() => {
    if (isEditing && (content !== document?.content || title !== document?.title)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, title, document, isEditing]);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  const handleSave = async () => {
    if (!document) {
      return;
    }
    
    try {
      await updateDocument({
        id: document.id,
        title: title,
        content: content || document.content,
      });
      setIsEditing(false);
      setHasUnsavedChanges(false);
      toast.success("Document updated successfully");
    } catch (error) {
      console.error("Failed to update document:", error);
      toast.error("Failed to update document");
    }
  };

  const handleShareClick = () => {
    if (!document) {
      return;
    }
    
    const shareUrl = `${window.location.origin}/shared/${document.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  };

  return (
    <Layout
      isLoading={isLoading}
      breadcrumbItems={[
        { title: "Docs", url: "/documents" },
        { title: document?.title || "Loading..." },
      ]}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          {isEditing ? (
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-background heading-1 outline-none"
            />
          ) : (
            <>
              {isLoading ? (
                <Skeleton className="w-1/2 h-10" />
              ) : (
                <h1 className="heading-1 flex items-center gap-2">
                  {document?.title}
                  {document?.isPublished ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <BadgeCheck className="w-5 h-5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Published</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-muted-foreground font-normal"
                    >
                      Draft
                    </Badge>
                  )}
                </h1>
              )}
            </>
          )}
          <div className="flex gap-2">
            {isEditing ? (
              <Button size="default" onClick={handleSave}>
                <Save className="w-4 h-4" />
                Save
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {document?.isPublished && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleShareClick}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share document</TooltipContent>
                  </Tooltip>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {document ? (
                  <DeleteDocumentWithAlertDialog id={document.id}>
                    <Button
                      size="icon"
                      variant="outline"
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DeleteDocumentWithAlertDialog>
                ) : null}
                {document ? (
                  document.isPublished ? (
                    <PublishDocumentWithAlertDialog
                      id={document.id}
                      title={document.title}
                      content={document.content}
                      isPublished={document.isPublished}
                    >
                      <Button
                        className="hover:text-destructive"
                        size="icon"
                        variant="outline"
                      >
                        <BadgeX className="w-4 h-4" />
                      </Button>
                    </PublishDocumentWithAlertDialog>
                  ) : (
                    <PublishDocumentWithAlertDialog
                      id={document.id}
                      title={document.title}
                      content={document.content}
                      isPublished={document.isPublished}
                    >
                      <Button size="icon" variant="outline">
                        <BadgeCheck className="w-4 h-4" />
                      </Button>
                    </PublishDocumentWithAlertDialog>
                  )
                ) : null}
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
    </Layout>
  );
}
