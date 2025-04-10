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
import { CheckSquare, Folder, Link2, Info } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const handleTabChange = React.useCallback(
    (tab: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", tab);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandGroup heading="Current Project">
        {projectId && (
          <>
            <CommandItem
              onSelect={() => runCommand(() => handleTabChange("tasks"))}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Tasks
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => handleTabChange("resources"))}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Resources
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => handleTabChange("about"))}
            >
              <Info className="mr-2 h-4 w-4" />
              About
            </CommandItem>
          </>
        )}
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
