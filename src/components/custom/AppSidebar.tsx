import { InboxIcon, BookOpen, Sprout, PencilRuler, Github, FolderOpen, Folder } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem
} from "../../components/ui/sidebar";
import { Link } from "wasp/client/router";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/button";

export type SidebarItem = {
  isActive: boolean;
  title: string;
  icon: any;
  items: { title: string; url: string }[];
};

export function AppSidebar({ items }: { items: SidebarItem[] }) {
  // Get the current path
  const currentPath = window.location.pathname;
  // const { data: projects } = useQuery(getProjects);
  // const pinnedProjects = projects?.filter((project) => project.pinned) || [];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to={"/"}>
                <Sprout className="h-5 w-5" />
                <span className="text-base font-semibold">Cultivate</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath === "/inbox"}>
                <Link to={"/inbox"}>
                  <InboxIcon className="h-5 w-5" />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath.includes("/canvas")}>
                <Link to={"/canvases"}>
                  <PencilRuler className="h-5 w-5" />
                  <span>Canvas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath.includes("/documents")}
              >
                <Link to={"/documents"}>
                  <BookOpen className="h-5 w-5" />
                  <span>Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  currentPath === "/" || currentPath.includes("/projects")
                }
              >
                <Link to={"/"}>
                  {currentPath === "/" ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
                  <span>Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* {pinnedProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Pinned Projects</SidebarGroupLabel>
            <SidebarMenu>
              {pinnedProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === `/projects/${project.id}`}
                  >
                    <Link
                      to="/projects/:projectId"
                      params={{ projectId: project.id }}
                    >
                      <span className="truncate">{project.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )} */}
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-between">
        <ThemeToggle />
        <a target="_blank" href="https://git.new/cultivate">
          <Button variant="ghost" size="icon" className="p-0">
            <Github className="w-4 h-4 text-muted-foreground" />
          </Button>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
