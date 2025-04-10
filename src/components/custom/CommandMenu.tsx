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
import { Folder } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { data: projects } = useQuery(getProjects);

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
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
