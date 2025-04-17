import { ChevronRight, InboxIcon, BookOpen, Plus, Sprout, PencilRuler } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "../../components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { Link } from 'wasp/client/router'
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export type SidebarItem = {
  isActive: boolean;
  title: string;
  icon: any;
  items: { title: string; url: string }[];
};

export function AppSidebar({ items }: { items: SidebarItem[] }) {
  const [showProjects, setShowProjects] = useState(() => {
    const showProjectsLocalStorage = JSON.parse(localStorage.getItem("showProjects") || "true");
    return showProjectsLocalStorage;
  });

  const handleToggleProjects = () => {
    setShowProjects((prev: boolean) => {
      localStorage.setItem("showProjects", (!prev).toString());
      return !prev;
    });
  };

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
              <SidebarMenuButton asChild isActive={currentPath === "/documents"}>
                <Link to={"/documents"}>
                  <BookOpen className="h-5 w-5" />
                  <span>Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {items.map((item: any) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={showProjects}
                onOpenChange={handleToggleProjects}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.length ? item.items?.sort((a: any, b: any) => a.title.localeCompare(b.title))?.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton isActive={subItem.isActive} asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )) : (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={currentPath === "/"}>
                            <Link to={"/"}>
                              <Plus className="h-5 w-5" />
                              <span>New Project</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
