import { Fragment, ReactNode, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./custom/AppSidebar";
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
import { ThemeProvider } from "./custom/ThemeProvider";
import { Folder } from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { useQuery } from "wasp/client/operations";

interface LayoutProps {
  children: ReactNode;
  breadcrumbItems?: {
    title: string;
    url?: string;
  }[];
  activeProjectId?: number;
  mainContentClasses?: string;
}

export function Layout({
  children,
  breadcrumbItems = [],
  activeProjectId,
  mainContentClasses,
}: LayoutProps) {
  const isSidebarHidden = JSON.parse(
    localStorage.getItem("isSidebarHidden") || "false"
  );
  const [open, setOpen] = useState(Boolean(isSidebarHidden));
  const { data: projects } = useQuery(getProjects);

  const toggleSidebar = () => {
    setOpen((open) => {
      localStorage.setItem("isSidebarHidden", (!open).toString());
      return !open;
    });
  };

  return (
    <ThemeProvider>
      <SidebarProvider onOpenChange={toggleSidebar} open={open}>
        <CommandMenu />
        <Toaster />
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
                  isActive: project.id === activeProjectId,
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
                {breadcrumbItems.map((item, index) => (
                  <Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.url ? (
                        <a href={item.url}>{item.title}</a>
                      ) : (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className={`max-w-2xl w-full mx-auto p-6 ${mainContentClasses}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
