import { useNavigate } from "react-router-dom";
import { useQuery, getCanvases } from "wasp/client/operations";
import { Canvas } from "wasp/entities";
import { Layout } from "../../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import {
  EmptyStateRoot,
  EmptyStateDescription,
  EmptyStateTitle,
  EmptyStateAction,
  EmptyStateIcon,
} from "../../components/custom/EmptyStateView";
import { File } from "lucide-react";

export function CanvasesPage() {
  const navigate = useNavigate();
  const { data: canvases, isLoading, error } = useQuery(getCanvases);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  if (!canvases?.length) {
    return (
      <Layout breadcrumbItems={[{ title: "Canvases" }]}>
        <EmptyStateRoot className="mx-auto">
          <EmptyStateIcon>
            <File />
          </EmptyStateIcon>
          <EmptyStateTitle>Create your first canvas</EmptyStateTitle>
          <EmptyStateDescription>
            Start drawing and organizing your ideas visually.
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button
              variant="outline"
              onClick={() => navigate("/canvas/new")}
            >
              New Canvas
            </Button>
          </EmptyStateAction>
        </EmptyStateRoot>
      </Layout>
    );
  }

  return (
    <Layout breadcrumbItems={[{ title: "Canvases" }]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="heading-1">Canvases</h1>
          <Button variant="outline" onClick={() => navigate("/canvas/new")}>
            <Plus className="w-4 h-4 mr-2" />
            New Canvas
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canvases?.map((canvas: Canvas) => (
              <TableRow
                key={canvas.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/canvas/${canvas.id}`)}
              >
                <TableCell className="font-medium">
                  Canvas {canvas.id}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(canvas.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
} 