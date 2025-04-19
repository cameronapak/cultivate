import { InboxIcon, BookOpen, Sprout, PencilRuler } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import { Link } from 'wasp/client/router'
import { ThemeToggle } from "./ThemeToggle";

export type SidebarItem = {
  isActive: boolean;
  title: string;
  icon: any;
  items: { title: string; url: string }[];
};

export function AppSidebar({ items }: { items: SidebarItem[] }) {
  // Get the current path
  const currentPath = window.location.pathname;

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
          {/* <SidebarGroupLabel>Projects</SidebarGroupLabel> */}
          <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath === "/inbox"}>
                <Link to={"/inbox"}>
                  <InboxIcon className="h-5 w-5" />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath.includes("/canvas")}>
                <Link to={"/canvases"}>
                  <PencilRuler className="h-5 w-5" />
                  <span>Canvas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath.includes("/documents")}>
                <Link to={"/documents"}>
                  <BookOpen className="h-5 w-5" />
                  <span>Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={currentPath === "/"}>
                <Link to={"/"}>
                  <PencilRuler className="h-5 w-5" />
                  <span>Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
