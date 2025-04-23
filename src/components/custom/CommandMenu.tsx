import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, getProjects } from "wasp/client/operations";
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
} from "lucide-react";
import { useLayoutState } from "../../hooks/useLayoutState";
import { useSidebar } from "../ui/sidebar";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();
  const { data: projects } = useQuery(getProjects, undefined, {
    enabled: search.length > 0,
  });
  const {
    hideCompletedTasks,
    toggleHideCompleted,
  } = useLayoutState();
  const { open: isSidebarOpen, toggleSidebar } = useSidebar();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  // Determine if the command menu is open on a project page
  const isProjectPage = window.location.pathname.includes("/projects/");

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandGroup heading="Actions">
          {isProjectPage && (
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
          )}
          <CommandItem onSelect={() => runCommand(toggleSidebar)}>
            {isSidebarOpen ? (
              <PanelLeftClose className="mr-2 h-4 w-4" />
            ) : (
              <PanelLeftOpen className="mr-2 h-4 w-4" />
            )}
            {isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                navigate(`/inbox`);
              })
            }
          >
            <InboxIcon className="mr-2 h-4 w-4" />
            Open Inbox
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                navigate(`/documents`);
              })
            }
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Open Docs
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandEmpty>No results found.</CommandEmpty>
        {search.length > 0 && (
          <CommandGroup heading="Projects">
            {projects?.map((project: Project) => (
              <CommandItem
                key={project.id}
                onSelect={() =>
                  runCommand(() =>
                    navigate(`/projects/${project.id}${window.location.search}`)
                  )
                }
              >
                <Folder className="mr-2 h-4 w-4" />
                Open "{project.title}"
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Canvas">
          <CommandItem>
            <PencilRuler className="mr-2 h-4 w-4" />
            Open Canvas
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
