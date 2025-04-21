import { useNavigate } from "react-router-dom";
import { useQuery, getCanvases, deleteCanvas } from "wasp/client/operations";
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
import { PencilRuler, Plus, Trash2 } from "lucide-react";
import {
  EmptyStateRoot,
  EmptyStateDescription,
  EmptyStateTitle,
  EmptyStateAction,
  EmptyStateIcon,
} from "../../components/custom/EmptyStateView";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { toast } from "sonner";

export function CanvasesPage() {
  const navigate = useNavigate();
  const { data: canvases, isLoading, error } = useQuery(getCanvases);

  const handleDeleteCanvas = async (canvasId: string) => {
    try {
      if (confirm("Are you sure you want to delete this canvas?")) {
        await deleteCanvas({ id: canvasId });
        toast.success("Canvas deleted");
      }
    } catch (error) {
      console.error("Failed to delete canvas:", error);
      toast.error("Failed to delete canvas");
    }
  };

  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  if (!canvases?.length) {
    return (
      <Layout isLoading={isLoading} breadcrumbItems={[{ title: "Canvases" }]}>
        <EmptyStateRoot className="mx-auto">
          <EmptyStateIcon>
            <PencilRuler />
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
    <Layout isLoading={isLoading} breadcrumbItems={[{ title: "Canvas" }]}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="heading-1">Canvas</h1>
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
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canvases?.map((canvas: Canvas) => (
              <TableRow
                key={canvas.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell 
                  className="font-medium"
                  onClick={() => navigate(`/canvas/${canvas.id}`)}
                >
                  {canvas.title}
                </TableCell>
                <TableCell 
                  className="text-sm text-muted-foreground"
                  onClick={() => navigate(`/canvas/${canvas.id}`)}
                >
                  {new Date(canvas.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCanvas(canvas.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete canvas</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
} 