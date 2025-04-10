import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { Folder, Eye, EyeOff, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projects } = useQuery(getProjects);
  
  const hideCompletedTasks = searchParams.get("hideCompleted") === "true";
  const hideSidebar = searchParams.get("hideSidebar") === "true";

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

  const toggleHideCompleted = () => {
    setSearchParams((prev) => {
      prev.set("hideCompleted", hideCompletedTasks ? "true" : "false");
      return prev;
    });
  };

  const toggleHideSidebar = () => {
    setSearchParams((prev) => {
      prev.set("hideSidebar", hideSidebar ? "true" : "false");
      return prev;
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandGroup heading="This Project">
        <CommandItem onSelect={() => runCommand(toggleHideCompleted)}>
          {hideCompletedTasks ? (
            <Eye className="mr-2 h-4 w-4" />
          ) : (
            <EyeOff className="mr-2 h-4 w-4" />
          )}
          {hideCompletedTasks ? "Show completed tasks" : "Hide completed tasks"}
        </CommandItem>
        <CommandItem onSelect={() => runCommand(toggleHideSidebar)}>
          {hideSidebar ? (
            <PanelLeftOpen className="mr-2 h-4 w-4" />
          ) : (
            <PanelLeftClose className="mr-2 h-4 w-4" />
          )}
          {hideSidebar ? "Show sidebar" : "Hide sidebar"}
        </CommandItem>
      </CommandGroup>
      <CommandList>
        <CommandSeparator />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project: Project) => (
            <CommandItem
              key={project.id}
              onSelect={() =>
                runCommand(() => navigate(`/projects/${project.id}`))
              }
            >
              <Folder className="mr-2 h-4 w-4" />
              {project.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
