import { useNavigate } from "react-router-dom";
import { useQuery, getCanvases, deleteCanvas, createResource, getProjects } from "wasp/client/operations";
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
import { PencilRuler, Plus, Trash2, ArrowRight } from "lucide-react";
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
import { Combobox } from "../../components/custom/ComboBox";

export function CanvasesPage() {
  const navigate = useNavigate();
  const { data: canvases, isLoading, error } = useQuery(getCanvases);
  const { data: projects, isLoading: projectsLoading } = useQuery(getProjects);

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

  if (!canvases?.length && !isLoading && !projectsLoading) {
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
            <Button variant="outline" onClick={() => navigate("/canvas/new")}>
              New Canvas
            </Button>
          </EmptyStateAction>
        </EmptyStateRoot>
      </Layout>
    );
  }

  return (
    <Layout
      isLoading={isLoading}
      breadcrumbItems={[{ title: "Canvas" }]}
      ctaButton={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/canvas/new")}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">New Canvas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Canvas</TooltipContent>
        </Tooltip>
      }
    >
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canvases?.map((canvas: Canvas) => (
              <TableRow
                key={canvas.id}
                className="group cursor-pointer hover:bg-muted/50"
              >
                <TableCell
                  className="font-medium"
                  onClick={() => navigate(`/canvas/${canvas.id}`)}
                  role="link"
                >
                  {canvas.title}
                </TableCell>
                <TableCell
                  className="text-sm text-muted-foreground"
                  onClick={() => navigate(`/canvas/${canvas.id}`)}
                  role="link"
                >
                  {new Date(canvas.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="group-hover:opacity-100 opacity-0 transition-opacity duration-150">
                  <div className="flex justify-end gap-2">
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
                        label: project.title,
                        value: project.id.toString(),
                      })) || []}
                      onChange={async (projectTitle: string, projectId: string) => {
                        try {
                          await createResource({
                            url: window.location.origin + "/canvas/" + canvas.id,
                            title: canvas.title,
                            projectId: parseInt(projectId, 10)
                          })
                          toast.success(`Canvas "${canvas.title}" added to Project "${projectTitle}"`);
                        } catch (error) {
                          toast.error("Failed to add canvas to project");
                        }
                      }}
                    />
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
