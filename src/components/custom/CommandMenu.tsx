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
import { Project } from "../../types";
import { Folder, Eye, EyeOff } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projects } = useQuery(getProjects);
  
  const hideCompletedTasks = searchParams.get("hideCompleted") === "true";

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
    const newParams = new URLSearchParams(searchParams);
    if (hideCompletedTasks) {
      newParams.delete("hideCompleted");
    } else {
      newParams.set("hideCompleted", "true");
    }
    setSearchParams(newParams);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
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
