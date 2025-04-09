import { useParams, useNavigate } from "react-router-dom";
import { useQuery, getProject, deleteProject } from "wasp/client/operations";
import { ProjectView } from "./components/ProjectView";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/custom/AppSidebar";
import { Folder, Trash2 } from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { Project } from "./types";
import { Separator } from "./components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "./components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { useState } from "react";

export const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const parsedProjectId = parseInt(projectId || "0", 10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(getProject, { projectId: parsedProjectId });
  const { data: projects } = useQuery(getProjects);

  const handleDeleteProject = async () => {
    try {
      await deleteProject({ id: parsedProjectId });
      setIsDeleteDialogOpen(false);
      // Redirect to main page after successful deletion
      navigate("/");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <SidebarProvider>
      <AppSidebar
        items={[
          {
            isActive: true,
            title: "Projects",
            icon: Folder,
            items:
              projects?.map((project) => ({
                title: project.title,
                url: `/projects/${project.id}`,
                isActive: project.id === parsedProjectId,
              })) || [],
          },
        ]}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the project
                  "{project.title}" and all of its tasks and resources.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>
        <div className="container mx-auto p-6">
          <ProjectView project={project as Project} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
