import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, getPublicDocument } from "wasp/client/operations";
import { BlockNoteEditor } from "../components/custom/BlockNoteEditor";
import { Button } from "../components/ui/button";
import { BadgeCheck } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import Logo from "../components/custom/Logo";

export function SharedDocumentPage() {
  const { documentId } = useParams();
  const parsedDocumentId = parseInt(documentId || "0", 10);
  const {
    data: document,
    isLoading,
    error,
  } = useQuery(getPublicDocument, { documentId: parsedDocumentId });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error.message}</p>
          <p className="mt-4">This document might not exist or is not published.</p>
          <Button className="mt-4" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto p-6 mt-8">
      <Logo className="text-muted-foreground" />

      <div>
        <div className="mt-8 flex justify-between items-center mb-4">
          {isLoading ? (
            <Skeleton className="w-1/2 h-10" />
          ) : (
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {document.title}
              <BadgeCheck className="w-5 h-5 text-muted-foreground" />
              {document.user?.username && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  by {document.user.username}
                </span>
              )}
            </h1>
          )}
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-1/2 h-6" />
              <Skeleton className="w-1/3 h-6" />
            </div>
          ) : (
            <BlockNoteEditor
              editable={false}
              initialContent={document?.content || ""}
              onChange={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
} 