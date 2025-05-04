import { Fragment, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar, type SidebarItem } from "./custom/AppSidebar";
import { CommandMenu, CommandMenuProvider } from "./custom/CommandMenu";
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
import { EllipsisVertical } from "lucide-react";
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
    url?: any;
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(() => {
    return !JSON.parse(localStorage.getItem("isSidebarHidden") || "false");
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        if (window.location.pathname !== "/inbox") {
          navigate("/inbox");
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setOpen((prev) => {
          localStorage.setItem("isSidebarHidden", (!prev).toString());
          return !prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleSidebarOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    localStorage.setItem("isSidebarHidden", (!nextOpen).toString());
  };

  return (
    <ThemeProvider>
      <SidebarProvider open={open} onOpenChange={handleSidebarOpenChange}>
        <CommandMenuProvider>
          <CommandMenu />
          <Toaster />
          <AppSidebar />
          <SidebarInset>
            {import.meta.env.DEV && (
              <div className="pointer-events-none fixed px-12 py-1 -right-12 bottom-4 bg-muted text-muted-foreground rotate-[-38deg] text-base font-medium">
                STAGING
              </div>
            )}
            <header className="sticky left-0 right-0 top-0 z-20 bg-[hsl(var(--background))] flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
            <div
              className={`max-w-2xl w-full mx-auto p-6 ${mainContentClasses}`}
            >
              {children}
            </div>
          </SidebarInset>
        </CommandMenuProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
