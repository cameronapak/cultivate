import {
  InboxIcon,
  BookOpen,
  PencilRuler,
  Github,
  FolderOpen,
  Folder,
  Mail,
  MailPlus,
  Loader2,
  Archive,
  Package,
  PackageOpen,
  Search,
  Pin,
  User2,
  ChevronUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarGroupLabel,
  SidebarSeparator,
} from "../../components/ui/sidebar";
import { Link } from "wasp/client/router";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/button";
import Logo from "./Logo";
import { Card, CardDescription, CardHeader } from "../ui/card";
import {
  generateInviteCode,
  getProjects,
  useQuery,
} from "wasp/client/operations";
import { toast } from "sonner";
import { useState } from "react";
import { Kbd } from "./Kbd";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useCommandMenu } from "./CommandMenu";
import { AppColorThemeToggle } from "./AppColorThemeToggle";
import { DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DropdownMenu } from "../ui/dropdown-menu";
import { useAuth, logout } from "wasp/client/auth";

export type SidebarItem = {
  isActive: boolean;
  title: string;
  icon: any;
};

export function AppSidebar() {
  const { data: user } = useAuth();
  // Get the current path
  const currentPath = window.location.pathname;
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { openCommandMenu } = useCommandMenu();
  const { data: pinnedProjects } = useQuery(getProjects, { pinned: true });

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const newCode = await generateInviteCode();
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Invite code generated:</p>
          <p className="font-bold select-all font-mono w-fit max-w-full bg-muted text-muted-foreground p-2 rounded-md">
            {newCode.code}
          </p>
        </div>
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to generate invite code."
      );
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Make it where pinned projects is a max of 3
  const pinnedProjectsWithLimit = pinnedProjects?.slice(0, 3) || [];

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
            <SidebarMenuAction onClick={openCommandMenu}>
              <Search className="h-5 w-5 text-muted-foreground" />{" "}
              <span className="sr-only">Search</span>
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="group"
                asChild
                isActive={currentPath === "/inbox"}
              >
                <Link to={"/inbox"}>
                  <InboxIcon className="h-5 w-5 text-muted-foreground" />
                  <span>Inbox</span>
                  <Kbd className="absolute right-2 top-0 bottom-0 h-fit my-auto group-hover:opacity-100 opacity-0 transition-all duration-300 border border-border rounded-sm px-1">
                    ⌘ + i
                  </Kbd>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath.includes("/canvas")}
              >
                <Link to={"/canvases"}>
                  <PencilRuler className="h-5 w-5 text-muted-foreground" />
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
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span>Docs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  currentPath === "/"
                }
              >
                <Link to={"/"}>
                  {currentPath === "/" ? (
                    <FolderOpen className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <Folder className="text-muted-foreground h-5 w-5" />
                  )}
                  <span>Collections</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {pinnedProjectsWithLimit?.length ? (
              <SidebarSeparator />
            ) : null}
            {pinnedProjectsWithLimit?.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === `/projects/${project.id}`}
                >
                  <Link
                    to="/projects/:projectId"
                    params={{ projectId: project.id }}
                  >
                    <Pin className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate">{project.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-col items-start justify-between">
        <Card className="w-full">
          <CardHeader>
            <CardDescription className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Thanks for being an early tester of Cultivate, an indie project
                created by{" "}
                <a
                  href="https://cameronpak.com"
                  target="_blank"
                  className="hover:underline"
                >
                  Cam
                </a>
                . Honestly, things will be buggy. Your feedback is invaluable to
                me.
              </p>
              <a
                className="flex flex-row items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline p-0 m-0"
                href="mailto:cam@cultivate.so?subject=Cultivate%20Feedback"
                target="_blank"
              >
                <Mail className="w-3 h-3" />
                Send Feedback
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="w-full flex flex-row justify-between items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <ThemeToggle />
            <AppColorThemeToggle />
          </div>
          <div className="flex flex-row items-center gap-2">
            <a target="_blank" href="https://git.new/cultivate">
              <Button variant="ghost" size="icon" className="p-0">
                <Github className="w-4 h-4 text-muted-foreground" />
              </Button>
            </a>
            <Button
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              variant="ghost"
              size="icon"
              className="p-0 text-muted-foreground"
            >
              {isGeneratingCode ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MailPlus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {isGeneratingCode ? "Generating..." : "Generate Invite Code"}
              </span>
            </Button>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 className="text-muted-foreground" /> {user?.getFirstProviderUserId() || ""}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={logout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
