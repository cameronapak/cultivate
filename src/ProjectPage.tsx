import { useParams } from "react-router-dom";
import { useQuery, getProject } from "wasp/client/operations";
import { ProjectView } from "./components/ProjectView";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/custom/AppSidebar";
import { Folder } from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { Project } from "./types";

export const ProjectPage = () => {
  const { projectId } = useParams();
  const parsedProjectId = parseInt(projectId || "0", 10);
  
  const { data: project, isLoading, error } = useQuery(getProject, { projectId: parsedProjectId });
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
            items: projects?.map((project) => ({
              title: project.title,
              url: `/projects/${project.id}`,
              isActive: project.id === parsedProjectId
            })) || []
          }
        ]}
      />
      <div className="container mx-auto px-6 py-12">
        <ProjectView project={project as Project} />
      </div>
    </SidebarProvider>
  );
}; 