import { useNavigate } from "react-router-dom";
import { createResource, deleteDocument, useQuery } from "wasp/client/operations";
import { getDocuments, getProjects } from "wasp/client/operations";
import { Document } from "wasp/entities";
import { Layout } from "../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { BadgeCheck, Plus, File, MoreHorizontal, Trash2, LinkIcon, ArrowRight } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  EmptyStateRoot,
  EmptyStateDescription,
  EmptyStateTitle,
  EmptyStateAction,
  EmptyStateIcon,
} from "../components/custom/EmptyStateView";
import { toast } from "sonner";
import { Combobox } from "../components/custom/ComboBox";

export function DocumentsPage() {
  const navigate = useNavigate();
  const { data: projects } = useQuery(getProjects);
  const { data: documents, isLoading, error } = useQuery(getDocuments);

  const handleDeleteDocument = async (documentId: string) => {
    try {
      if (confirm("Are you sure you want to delete this document?")) {
        await deleteDocument({ id: documentId });
        toast.success("Document deleted");
      }
    } catch (error) {
      console.error("Failed to delete doc:", error);
      toast.error("Failed to delete doc");
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (documents?.length === 0) {
    return (
      <Layout isLoading={isLoading} breadcrumbItems={[{ title: "Docs" }]}>
        <EmptyStateRoot className="mx-auto">
          <EmptyStateIcon>
            <File />
          </EmptyStateIcon>
          <EmptyStateTitle>Create your first document</EmptyStateTitle>
          <EmptyStateDescription>
            Get things out of your head and organized.
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button
              variant="outline"
              onClick={() => navigate("/documents/new")}
            >
              New Document
            </Button>
          </EmptyStateAction>
        </EmptyStateRoot>
      </Layout>
    );
  }

  return (
    <Layout 
      isLoading={isLoading} 
      breadcrumbItems={[{ title: "Docs" }]}
      ctaButton={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => navigate("/documents/new")}>
              <Plus className="w-4 h-4" />
              <span className="sr-only">New Document</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Document</TooltipContent>
        </Tooltip>
      }
    >
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[64px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((document: Document) => (
              <TableRow
                key={document.id}
                className="group cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/documents/${document.id}`)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <p className="line-clamp-1">{document.title}</p>
                    {document.isPublished ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <BadgeCheck className="w-4 h-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>Published</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground font-normal"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(document.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex items-center gap-2 group-hover:opacity-100 opacity-0 transition-opacity duration-150">
                  {/* Add the url of doc as a Resource on a project */}
                  <Combobox
                    button={(
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        variant="outline"
                        size="icon"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                    options={projects?.map((project) => ({
                      // The label is what's searchable.
                      label: project.title,
                      value: project.id.toString(),
                    })) || []}
                    onChange={async (projectTitle: string, projectId: string) => {
                      try {
                        await createResource({
                          url: window.location.origin + "/documents/" + document.id,
                          title: document.title,
                          projectId: parseInt(projectId, 10)
                        })
                        toast.success(`Document "${document.title}" added to Project "${projectTitle}"`);
                      } catch (error) {
                        toast.error("Failed to move item");
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(document.id);
                    }}
                    variant="outline"
                    size="icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
