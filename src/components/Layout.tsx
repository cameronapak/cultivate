import { Fragment, ReactNode, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar, type SidebarItem } from "./custom/AppSidebar";
import { CommandMenu } from "./custom/CommandMenu";
import { Separator } from "./ui/separator";
import { Toaster } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Progress } from "./ui/progress";
import { ThemeProvider } from "./custom/ThemeProvider";
import { EllipsisVertical, Folder } from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { useQuery } from "wasp/client/operations";
import { Link } from "wasp/client/router";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "./ui/dropdown-menu";

interface MenuItem {
  title: string;
  icon: ReactNode;
  action: () => void;
  isDestructive?: boolean;
}

interface LayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  breadcrumbItems?: {
    title: string;
    url: any;
  }[];
  activeProjectId?: number;
  mainContentClasses?: string;
  menuItems?: MenuItem[];
  ctaButton?: ReactNode;
}

export function Layout({
  children,
  isLoading = false,
  breadcrumbItems = [],
  activeProjectId,
  mainContentClasses,
  menuItems = [],
  ctaButton,
}: LayoutProps) {
  const isSidebarHidden = JSON.parse(
    localStorage.getItem("isSidebarHidden") || "false"
  );
  const [open, setOpen] = useState(Boolean(isSidebarHidden));
  const { data: projects, isLoading: areProjectsLoading } =
    useQuery(getProjects);

  const toggleSidebar = () => {
    setOpen((open) => {
      localStorage.setItem("isSidebarHidden", (!open).toString());
      return !open;
    });
  };

  const sidebarItems: SidebarItem[] = areProjectsLoading
    ? []
    : [
        {
          isActive: true,
          title: "Projects",
          icon: Folder,
          items:
            projects?.map((project: { id: number; title: string }) => ({
              title: project.title,
              url: `/projects/${project.id}`,
              isActive: project.id === activeProjectId,
            })) || [],
        },
      ];

  return (
    <ThemeProvider>
      <SidebarProvider onOpenChange={toggleSidebar} open={open}>
        <CommandMenu />
        <Toaster />
        <AppSidebar items={sidebarItems} />
        <SidebarInset>
          <header className="relative flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="flex-1">
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.url ? (
                        <Link to={item.url}>{item.title}</Link>
                      ) : (
                        <BreadcrumbPage className="ellipsis">
                          {item.title}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {ctaButton || null}

            {menuItems.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem
                      key={index}
                      className={`flex items-center gap-2 ${
                        item.isDestructive
                          ? "group hover:!text-destructive-foreground hover:!bg-destructive"
                          : ""
                      }`}
                      onClick={item.action}
                    >
                      {item.icon}
                      {item.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {isLoading ? (
              <div className="absolute -bottom-1 left-0 right-0">
                <Progress indeterminate />
              </div>
            ) : null}
          </header>
          <div className={`max-w-2xl w-full mx-auto p-6 ${mainContentClasses}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
