import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, getProjects, globalSearch } from "wasp/client/operations";
import { debounce } from "../../lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { DialogTitle } from "../ui/dialog";
import { Project } from "../../types";
import {
  Folder,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  InboxIcon,
  PencilRuler,
  FileText,
  Link2,
  Square,
  Minus,
} from "lucide-react";
import { useLayoutState } from "../../hooks/useLayoutState";
import { useSidebar } from "../ui/sidebar";
import { AnimatePresence, motion, MotionProps } from "motion/react";

type NavigationCommand = {
  title: string;
  icon: React.ReactNode;
  path: string;
};

function MotionAnimateHeight({
  children,
  ...props
}: { children: React.ReactNode } & MotionProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
      // https://developer.chrome.com/docs/css-ui/animate-to-height-auto
      animate={{ height: "calc-size(min-content, size)", opacity: 1, filter: "blur(0px)" }}
      exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
      transition={{ type: "spring", bounce: 0.1, duration: 0.25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// CommandMenuContext for global open/close
const CommandMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  openCommandMenu: () => void;
} | undefined>(undefined);

export function useCommandMenu() {
  const ctx = React.useContext(CommandMenuContext);
  if (!ctx) throw new Error("useCommandMenu must be used within CommandMenuProvider");
  return ctx;
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const openCommandMenu = React.useCallback(() => setOpen(true), []);
  return (
    <CommandMenuContext.Provider value={{ open, setOpen, openCommandMenu }}>
      {children}
    </CommandMenuContext.Provider>
  );
}

export function CommandMenu() {
  const { open, setOpen } = useCommandMenu();
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { data: projects } = useQuery(getProjects, null, {
    enabled: debouncedSearch.length > 0,
  });
  // Add a minimum search length to reduce unnecessary searches
  const { data: searchResults, isLoading: isLoadingQuery } = useQuery(
    globalSearch,
    { query: debouncedSearch },
    {
      enabled: debouncedSearch.length >= 3, // Only search with 3+ characters
      staleTime: 30000, // Cache results for 30 seconds
      cacheTime: 300000, // Keep unused data in cache for 5 minutes
    }
  );
  const { hideCompletedTasks, toggleHideCompleted } = useLayoutState();
  const { open: isSidebarOpen, toggleSidebar } = useSidebar();

  // Create debounced search handler
  const debouncedSetSearch = React.useMemo(
    () => debounce((value: string) => setDebouncedSearch(value), 250),
    []
  );

  // Update debounced value when search changes
  React.useEffect(() => {
    debouncedSetSearch(search);
  }, [search]);

  // Navigation commands
  const navigationCommands: NavigationCommand[] = React.useMemo(
    () => [
      {
        title: "Open Inbox",
        icon: <InboxIcon className="mr-2 h-4 w-4" />,
        path: "/inbox",
      },
      {
        title: "Open Docs",
        icon: <BookOpen className="mr-2 h-4 w-4" />,
        path: "/documents",
      },
      {
        title: "Open Projects",
        icon: <Folder className="mr-2 h-4 w-4" />,
        path: "/",
      },
      {
        title: "Open Canvases",
        icon: <PencilRuler className="mr-2 h-4 w-4" />,
        path: "/canvases",
      },
    ],
    []
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open ? false : true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Determine if the command menu is open on a project page
  const isProjectPage = window.location.pathname.includes("/projects/");

  const getIconForType = (type: string) => {
    switch (type) {
      case "task":
        return <Square className="mr-2 h-2 w-2 text-muted-foreground" />;
      case "resource":
        return <Link2 className="mr-2 h-2 w-2 text-muted-foreground" />;
      case "thought":
        return <Minus className="mr-2 h-2 w-2 text-muted-foreground" />;
      default:
        return null;
    }
  };

  type SearchResult = {
    id: string;
    type: "task" | "resource" | "thought";
    projectId?: string | number | null;
    title?: string;
    content?: string;
    url?: string;
    isAway: boolean;
  };

  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "task":
        if (result.projectId) {
          navigate(
            `/projects/${result.projectId}?resource=${result.id}&tab=task`
          );
        } else {
          navigate(`/inbox?resource=${result.id}&type=task`);
        }
        break;
      case "resource":
        if (result.projectId) {
          navigate(
            `/projects/${result.projectId}?resource=${result.id}&tab=resource`
          );
        } else {
          navigate(`/inbox?resource=${result.id}&type=resource`);
        }
        break;
      case "thought":
        if (result.projectId) {
          navigate(
            `/projects/${result.projectId}?resource=${result.id}&tab=notes`
          );
        } else {
          navigate(`/inbox?resource=${result.id}&type=thought`);
        }
        break;
    }
  };

  // Helper function to check if text matches search query
  const matchesSearch = (text: string): boolean => {
    if (!search) return true;
    return text.toLowerCase().includes(search.toLowerCase());
  };

  // Filter projects that match the search query
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => matchesSearch(project.title));
  }, [projects, search]);

  // Filter navigation commands that match the search query
  const filteredNavigationCommands = React.useMemo(() => {
    return navigationCommands.filter((cmd) => matchesSearch(cmd.title));
  }, [navigationCommands, search]);

  // Check if action commands match the search query
  const showHideCompletedAction =
    matchesSearch("Hide completed tasks") ||
    matchesSearch("Show completed tasks");
  const showSidebarAction =
    matchesSearch("Hide sidebar") || matchesSearch("Show sidebar");

  return (
    <CommandDialog shouldFilter={false} open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput
        isLoading={isLoadingQuery && search.length > 0}
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <AnimatePresence>
        <CommandList>
          {searchResults && searchResults?.length > 0 && (
            <>
              <CommandGroup heading="Search Results">
                {searchResults.map((result: any, index: number) => (
                  <MotionAnimateHeight key={`${result.id}-${result.type}`}>
                    <CommandItem
                      onSelect={() =>
                        runCommand(() => handleSearchResultClick(result))
                      }
                    >
                      {getIconForType(result.type)}
                      <div className="flex flex-col">
                        <span>
                          {result.title || result.content || "Untitled"}
                          {result.type === "resource" && result.url && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({result.url})
                            </span>
                          )}
                        </span>
                        {result.description && (
                          <span className="text-xs text-muted-foreground line-clamp-2">
                            {result.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  </MotionAnimateHeight>
                ))}
              </CommandGroup>
              {filteredProjects.length > 0 && (
                <CommandGroup heading="Projects">
                  {filteredProjects.map((project: Project) => (
                    <MotionAnimateHeight key={project.id}>
                      <CommandItem
                        onSelect={() =>
                          runCommand(() =>
                            navigate(
                              `/projects/${project.id}${window.location.search}`
                            )
                          )
                        }
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        Open "{project.title}"
                      </CommandItem>
                    </MotionAnimateHeight>
                  ))}
                </CommandGroup>
              )}
            </>
          )}

          {(showHideCompletedAction || showSidebarAction) && (
            <CommandGroup heading="Actions">
              {isProjectPage && showHideCompletedAction && (
                <MotionAnimateHeight>
                  <CommandItem onSelect={() => runCommand(toggleHideCompleted)}>
                    {hideCompletedTasks ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    {hideCompletedTasks
                      ? "Show completed tasks"
                      : "Hide completed tasks"}
                  </CommandItem>
                </MotionAnimateHeight>
              )}
              {showSidebarAction && (
                <MotionAnimateHeight>
                  <CommandItem onSelect={() => runCommand(toggleSidebar)}>
                    {isSidebarOpen ? (
                      <PanelLeftClose className="mr-2 h-4 w-4" />
                    ) : (
                      <PanelLeftOpen className="mr-2 h-4 w-4" />
                    )}
                    {isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                  </CommandItem>
                </MotionAnimateHeight>
              )}
            </CommandGroup>
          )}

          {filteredNavigationCommands.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Pages">
                {filteredNavigationCommands.map((cmd) => (
                  <MotionAnimateHeight key={cmd.path}>
                    <CommandItem
                      onSelect={() => runCommand(() => navigate(cmd.path))}
                    >
                      {cmd.icon}
                      {cmd.title}
                    </CommandItem>
                  </MotionAnimateHeight>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          {searchResults && searchResults?.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        </CommandList>
      </AnimatePresence>
    </CommandDialog>
  );
}
