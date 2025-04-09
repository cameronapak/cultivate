import { useParams } from "react-router-dom";
import { useQuery, getProject } from "wasp/client/operations";
import { ProjectView } from "./components/ProjectView";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { AppSidebar } from "./components/custom/AppSidebar";
import { Folder } from "lucide-react";
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

export const ProjectPage = () => {
  const { projectId } = useParams();
  const parsedProjectId = parseInt(projectId || "0", 10);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(getProject, { projectId: parsedProjectId });
  const { data: projects } = useQuery(getProjects);

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
          <Breadcrumb>
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
        </header>
        <div className="container mx-auto p-6">
          <ProjectView project={project as Project} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
