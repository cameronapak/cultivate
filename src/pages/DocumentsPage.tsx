import { useNavigate } from "react-router-dom";
import { useQuery } from "wasp/client/operations";
import { getDocuments } from "wasp/client/operations";
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
import { BadgeCheck, Plus, File } from "lucide-react";
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

export function DocumentsPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading, error } = useQuery(getDocuments);

  if (error) return <div className="text-red-500">Error: {error.message}</div>;

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
    <Layout breadcrumbItems={[{ title: "Docs" }]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="heading-1">Docs</h1>
          <Button variant="outline" onClick={() => navigate("/documents/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Doc
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents?.map((document: Document) => (
              <TableRow
                key={document.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/documents/${document.id}`)}
              >
                <TableCell className="font-medium flex items-center gap-2">
                  {document.title}
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
                      className="text-muted-foreground font-normal"
                    >
                      Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(document.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
