import { InboxIcon, BookOpen, PencilRuler, Github, FolderOpen, Folder, Mail, MailPlus, Loader2, Archive, Package, PackageOpen } from "lucide-react";
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
import Logo from "./Logo";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  generateInviteCode
} from "wasp/client/operations";
import { toast } from "sonner";
import { useState } from "react";
import { Kbd } from "./Kbd";

export type SidebarItem = {
  isActive: boolean;
  title: string;
  icon: any;
  items: { title: string; url: string }[];
};

export function AppSidebar({ items }: { items: SidebarItem[] }) {
  // Get the current path
  const currentPath = window.location.pathname;
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const newCode = await generateInviteCode();
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Invite code generated:</p>
          <p className="font-bold select-all font-mono w-fit max-w-full bg-muted p-2 rounded-md">{newCode.code}</p>
        </div>
      );
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to generate invite code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="group" asChild isActive={currentPath === "/inbox"}>
                <Link to={"/inbox"}>
                  <InboxIcon className="h-5 w-5" />
                  <span>Inbox</span>
                  <Kbd>⌘ + i</Kbd>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="group" asChild isActive={currentPath === "/away"}>
                <Link to={"/away"}>
                  {currentPath === "/away" ? <PackageOpen className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  <span>Away</span>
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
      <SidebarFooter className="flex flex-col gap-4 items-start justify-between">
        <Card className="w-full">
          <CardHeader>
            <CardDescription className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">Thanks for being an early tester of Cultivate, an indie project created by <a href="https://cameronpak.com" target="_blank" className="hover:underline">Cam</a>. Honestly, things will be buggy. Your feedback is invaluable to me.</p>
              <a className="flex flex-row items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline p-0 m-0" href="mailto:cam@cultivate.so?subject=Cultivate%20Feedback" target="_blank">
                <Mail className="w-3 h-3" />
                Send Feedback
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-row items-center gap-2">
          <ThemeToggle />
          <a target="_blank" href="https://git.new/cultivate">
            <Button variant="ghost" size="icon" className="p-0">
              <Github className="w-4 h-4 text-muted-foreground" />
            </Button>
          </a>
          <Button onClick={handleGenerateCode} disabled={isGeneratingCode} variant="ghost" size="icon" className="p-0 text-muted-foreground">
            {isGeneratingCode ? <Loader2 className="h-5 w-5 animate-spin" /> : <MailPlus className="h-5 w-5" />}
            <span className="sr-only">{isGeneratingCode ? "Generating..." : "Generate Invite Code"}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
