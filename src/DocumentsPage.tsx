import { useNavigate } from "react-router-dom";
import { useQuery } from "wasp/client/operations";
import { getDocuments } from "wasp/client/operations";
import { Document } from "wasp/entities";
import { Layout } from "./components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Button } from "./components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

export function DocumentsPage() {
  const navigate = useNavigate();
  const { data: documents, isLoading, error } = useQuery(getDocuments);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Layout breadcrumbItems={[{ title: "Docs" }]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium">Docs</h1>
          <Button onClick={() => navigate("/documents/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Doc
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
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
                <TableCell className="font-medium">{document.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(document.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(document.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
