import { getInboxTasks, getInboxResources, useQuery, getThoughts } from "wasp/client/operations";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
  moveTask,
  createResource,
  deleteResource,
  moveResource,
  createThought,
  deleteThought,
} from "wasp/client/operations";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Trash2, MoveRight, Eye, EyeClosed, Coffee, ExternalLink, Send, BrainCircuit, Pencil, Minus } from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { Table, TableBody, TableRow, TableCell } from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Layout } from "../components/Layout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { toast } from "sonner";
import { Toggle } from "../components/ui/toggle";
import { EmptyStateView } from "../components/custom/EmptyStateView";
import { getFaviconFromUrl, getMetadataFromUrl, isUrl } from "../lib/utils";

// Add common shape type
type InboxItem = {
  id: number | string;
  title: string;
  content?: string;
  type: 'task' | 'resource' | 'thought';
  createdAt: Date;
  complete?: boolean;
  url?: string;
};

export function InboxPage() {
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery(getInboxTasks);
  const { data: resources, isLoading: isLoadingResources, error: resourcesError } = useQuery(getInboxResources);
  const { data: thoughts, isLoading: isLoadingThoughts, error: thoughtsError } = useQuery(getThoughts);
  const { data: projects } = useQuery(getProjects);
  const [newItemText, setNewItemText] = useState("");
  const [isThought, setIsThought] = useState(false);
  const [showInbox, setShowInbox] = useState(() => {
    const showTasksLocalStorage = JSON.parse(localStorage.getItem("shouldShowTasks") || "true");
    return showTasksLocalStorage;
  });

  const handleToggleTasks = () => {
    setShowInbox((prev: boolean) => {
      localStorage.setItem("shouldShowTasks", (!prev).toString());
      return !prev;
    });
  };

  const handleToggleIsThought = () => {
    setIsThought(prev => !prev);
  };

  const handleCreateItem = async () => {
    if (!newItemText.trim()) return;
    try {
      // Always check for URL first, regardless of mode
      if (isUrl(newItemText.trim())) {
        const metadata = await getMetadataFromUrl(newItemText.trim());
        // Create a resource
        await createResource({
          title: metadata.title || 'Untitled Resource',
          url: newItemText.trim(),
          description: metadata.description,
          // No projectId means it goes to inbox
        });
        toast.success(`Resource created: "${metadata.title || newItemText}"`);
      } else if (isThought) {
        // Create a thought
        await createThought({
          content: newItemText
        });
        toast.success(`Thought captured!`);
      } else {
        // Create a regular task
        await createTask({
          title: newItemText,
          // No projectId means it goes to inbox
        });
        toast.success(`Task created: "${newItemText}"`);
      }
      setNewItemText("");
    } catch (error) {
      console.error("Failed to create item:", error);
      toast.error("Failed to create item");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateItem();
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    try {
      await updateTaskStatus({
        id: taskId,
        complete: !currentStatus,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteTask({ id: taskId });
        toast.success("Task deleted");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    try {
      if (confirm("Are you sure you want to delete this resource?")) {
        await deleteResource({ id: resourceId });
        toast.success("Resource deleted");
      }
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  const handleDeleteThought = async (thoughtId: string) => {
    try {
      if (confirm("Are you sure you want to delete this thought?")) {
        await deleteThought({ id: thoughtId });
        toast.success("Thought deleted");
      }
    } catch (error) {
      console.error("Failed to delete thought:", error);
    }
  };

  const handleMoveItem = async (item: InboxItem, projectId: number) => {
    try {
      if (item.type === 'task') {
        await moveTask({
          taskId: item.id as number,
          projectId,
        });
      } else if (item.type === 'resource') {
        await moveResource({
          resourceId: item.id as number,
          projectId,
        });
      } else {
        // Thoughts cannot be moved to projects (for now)
        toast.error("Thoughts cannot be moved to projects");
        return;
      }
      toast.success(`${item.type} moved to project`);
    } catch (error) {
      console.error(`Failed to move ${item.type}:`, error);
      toast.error(`Failed to move ${item.type}`);
    }
  };

  const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Transform tasks, resources, and thoughts into a common shape and sort by date
  const inboxItems: InboxItem[] = [
    ...(tasks?.map(task => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      createdAt: task.createdAt,
      complete: task.complete,
    })) || []),
    ...(resources?.map(resource => ({
      id: resource.id,
      title: resource.title,
      type: 'resource' as const,
      createdAt: resource.createdAt,
      url: resource.url,
    })) || []),
    ...(thoughts?.map(thought => ({
      id: thought.id,
      title: thought.content.slice(0, 60) + (thought.content.length > 60 ? '...' : ''),
      content: thought.content,
      type: 'thought' as const,
      createdAt: thought.createdAt,
    })) || []),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (tasksError || resourcesError || thoughtsError) {
    return <div>Error: {tasksError?.message || resourcesError?.message || thoughtsError?.message}</div>;
  }

  return (
    <Layout isLoading={isLoadingTasks || isLoadingResources || isLoadingThoughts} breadcrumbItems={[{ title: "Brain Dump" }]}>
      <div>
        <div className="flex flex-col gap-2 items-start mb-4">
          <div className="flex gap-2 items-center">
            <h1 className="heading-1">Brain Dump</h1>
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  variant="outline"
                  onClick={handleToggleTasks}
                >
                  {showInbox ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeClosed className="h-5 w-5" />
                  )}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {showInbox ? "Hide inbox" : "Show inbox"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div>
          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle 
                    variant="outline" 
                    pressed={!isThought}
                    onClick={() => isThought && handleToggleIsThought()}
                    className="rounded-r-none"
                  >
                    <Pencil className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Task mode</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle 
                    variant="outline" 
                    pressed={isThought}
                    onClick={() => !isThought && handleToggleIsThought()}
                    className="rounded-l-none"
                  >
                    <BrainCircuit className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Thought mode</TooltipContent>
              </Tooltip>
            </div>
            <Input
              autoFocus={true}
              type="text"
              placeholder={isThought ? "Add a thought... (URLs will create resources)" : "Add a task... (URLs will create resources)"}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button type="submit" onClick={handleCreateItem} size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Add to inbox</span>
            </Button>
          </div>

          {showInbox ? (
            <div>
              <Table>
                <TableBody>
                  {inboxItems.map((item) => (
                    <TableRow className="grid grid-cols-[auto_1fr_auto] items-center" key={`${item.type}-${item.id}`}>
                      <TableCell className="w-8">
                        {item.type === 'task' ? (
                          <Checkbox
                            checked={item.complete}
                            onCheckedChange={() =>
                              handleToggleTask(item.id as number, item.complete || false)
                            }
                          />
                        ) : item.type === 'resource' ? (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {item.type === 'task' ? (
                          <span
                            className={`mr-2 ${
                              item.complete
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {item.title}
                          </span>
                        ) : item.type === 'resource' ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid items-center gap-2 hover:underline"
                            style={{ gridTemplateColumns: item.url ? '16px 1fr' : '1fr' }}
                          >
                            {item.url ? <img src={getFaviconFromUrl(item.url)} alt="Favicon" className="mt-0.5 w-4 h-4 bg-secondary rounded-sm" /> : null}
                            <span className="line-clamp-2 text-sm">{item.title}</span>
                          </a>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-sm">{item.content}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {getDaysAgo(item.createdAt)
                            ? getDaysAgo(item.createdAt) +
                              " day" +
                              (getDaysAgo(item.createdAt) > 1 ? "s" : "") +
                              " ago"
                            : "today"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.type !== 'thought' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <MoveRight className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Move {item.type} to a project
                                  </TooltipContent>
                                </Tooltip>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {projects?.length ? (
                                  projects?.map((project) => (
                                    <DropdownMenuItem
                                      key={project.id}
                                      onClick={() => handleMoveItem(item, project.id)}
                                    >
                                      Move to {project.title}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem className="text-muted-foreground">
                                    No projects found
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (item.type === 'task') 
                                    handleDeleteTask(item.id as number);
                                  else if (item.type === 'resource')
                                    handleDeleteResource(item.id as number);
                                  else
                                    handleDeleteThought(item.id as string);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete {item.type}</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {inboxItems.length === 0 && !isLoadingTasks && !isLoadingResources && !isLoadingThoughts && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center flex flex-col items-center justify-center text-muted-foreground"
                      >
                        <EmptyStateView
                          Icon={<Coffee className="h-10 w-10" />}
                          title="Inbox Zero"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="opacity-50 flex justify-center items-center h-full">
              <EmptyStateView
                Icon={<EyeClosed className="h-10 w-10" />}
                title="Inbox is safely hidden"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
