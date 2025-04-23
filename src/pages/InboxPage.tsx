import React from "react";
import {
  getInboxTasks,
  getInboxResources,
  useQuery,
  getThoughts,
} from "wasp/client/operations";
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
import {
  Trash2,
  MoveRight,
  Eye,
  EyeClosed,
  Coffee,
  // ExternalLink,
  Send,
  Link2,
  Minus,
  List,
  Dot,
} from "lucide-react";
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
import { EmptyStateView } from "../components/custom/EmptyStateView";
import { getFaviconFromUrl, getMetadataFromUrl, isUrl } from "../lib/utils";
import { cn } from "../lib/utils";

// Add common shape type
type InboxItem = {
  id: number | string;
  title: string;
  content?: string;
  type: "task" | "resource" | "thought";
  createdAt: Date;
  complete?: boolean;
  url?: string;
};

// Create a type where the string is a date in the format "2025-04-20"
type DateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

// Add this helper function to format dates consistently
const formatDate = (date: Date | DateString): string => {
  // Convert to Date object if it's a string
  const itemDate = typeof date === 'string' 
    ? new Date(date + 'T00:00:00') // Add time component to ensure consistent timezone handling
    : new Date(date);
  
  // Get current time in local timezone and set to midnight
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Set item date to midnight in local timezone for comparison
  const itemDateMidnight = new Date(itemDate);
  itemDateMidnight.setHours(0, 0, 0, 0);
  
  // Compare dates using their time values
  const nowTime = now.getTime();
  const itemTime = itemDateMidnight.getTime();
  
  if (nowTime === itemTime) {
    return "Today";
  }
  
  // Check for yesterday
  const yesterdayTime = nowTime - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
  if (itemTime === yesterdayTime) {
    return "Yesterday";
  }
  
  // For other dates, use native date formatting
  return itemDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

// Add this type for grouped items
type GroupedInboxItems = {
  [key: DateString]: InboxItem[];
};

// Add this type for filter options
type InboxFilter = 'all' | 'task' | 'resource' | 'thought';

export function InboxPage() {
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery(getInboxTasks);
  const {
    data: resources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery(getInboxResources);
  const {
    data: thoughts,
    isLoading: isLoadingThoughts,
    error: thoughtsError,
  } = useQuery(getThoughts);
  const { data: projects } = useQuery(getProjects);
  const [newItemText, setNewItemText] = useState("");
  const [isThought, setIsThought] = useState(false);
  const [showInbox, setShowInbox] = useState(() => {
    const showTasksLocalStorage = JSON.parse(
      localStorage.getItem("shouldShowTasks") || "true"
    );
    return showTasksLocalStorage;
  });
  const [filter, setFilter] = useState<InboxFilter>('all');

  const handleToggleTasks = () => {
    setShowInbox((prev: boolean) => {
      localStorage.setItem("shouldShowTasks", (!prev).toString());
      return !prev;
    });
  };

  const handleToggleIsThought = () => {
    setIsThought((prev) => !prev);
  };

  const handleCreateItem = async () => {
    if (!newItemText.trim()) return;
    try {
      // Always check for URL first, regardless of mode
      if (isUrl(newItemText.trim())) {
        const metadata = await getMetadataFromUrl(newItemText.trim());
        // Create a resource
        await createResource({
          title: metadata.title || "Untitled Resource",
          url: newItemText.trim(),
          description: metadata.description,
          // No projectId means it goes to inbox
        });
        toast.success(`Resource created: "${metadata.title || newItemText}"`);
      } else if (isThought) {
        // Create a thought
        await createThought({
          content: newItemText,
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
      if (item.type === "task") {
        await moveTask({
          taskId: item.id as number,
          projectId,
        });
      } else if (item.type === "resource") {
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

  // Group items by date
  const groupItemsByDate = (items: InboxItem[]): GroupedInboxItems => {
    const grouped: GroupedInboxItems = {};
    
    items.forEach(item => {
      // Format date as YYYY-MM-DD for consistent grouping, using local timezone
      const date = new Date(item.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}` as DateString;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    return grouped;
  };

  // Transform tasks, resources, and thoughts into a common shape
  const inboxItems: InboxItem[] = [
    ...(tasks?.map((task) => ({
      id: task.id,
      title: task.title,
      type: "task" as const,
      createdAt: new Date(task.createdAt), // Ensure it's a Date object
      complete: task.complete,
    })) || []),
    ...(resources?.map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: "resource" as const,
      createdAt: new Date(resource.createdAt), // Ensure it's a Date object
      url: resource.url,
    })) || []),
    ...(thoughts?.map((thought) => ({
      id: thought.id,
      title:
        thought.content.slice(0, 60) +
        (thought.content.length > 60 ? "..." : ""),
      content: thought.content,
      type: "thought" as const,
      createdAt: new Date(thought.createdAt), // Ensure it's a Date object
    })) || []),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Group items by date
  const groupedItems = groupItemsByDate(inboxItems);
  
  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedItems).sort().reverse() as DateString[];

  // Add this function to get item counts
  const getItemCount = (type: InboxFilter) => {
    if (type === 'all') return inboxItems.length;
    return inboxItems.filter(item => item.type === type).length;
  };

  if (tasksError || resourcesError || thoughtsError) {
    return (
      <div>
        Error:{" "}
        {tasksError?.message ||
          resourcesError?.message ||
          thoughtsError?.message}
      </div>
    );
  }

  let itemTypeButton: React.ReactNode | null = null;
  if (isThought && !isUrl(newItemText.trim())) {
    itemTypeButton = <Minus className="h-4 w-4" />;
  } else if (isUrl(newItemText.trim())) {
    itemTypeButton = <Link2 className="h-4 w-4" />;
  } else {
    itemTypeButton = <Dot className="h-4 w-4" />;
  }

  return (
    <Layout
      isLoading={isLoadingTasks || isLoadingResources || isLoadingThoughts}
      breadcrumbItems={[
        {
          title: "Inbox",
        },
      ]}
      ctaButton={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showInbox ? "outline" : "default"}
              type="submit"
              onClick={handleToggleTasks}
              size="icon"
            >
              {showInbox ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeClosed className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showInbox ? "Hide inbox" : "Show inbox"}
          </TooltipContent>
        </Tooltip>
      }
    >
      <div>
        <div>
          <div className="relative flex gap-4 mb-6">
            <Button
              className="absolute top-0 left-0 text-muted-foreground rounded-tr-none rounded-br-none"
              size="icon"
              variant="ghost"
              onClick={handleToggleIsThought}
            >
              {itemTypeButton}
              <span className="sr-only">
                {isThought ? "Add a thought" : "Add a task"}
              </span>
            </Button>

            <Input
              autoFocus={true}
              type="text"
              placeholder={isThought ? "Add a thought or URL..." : "Add a task..."}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 flex-1 pr-10"
            />

            <Button
              disabled={!newItemText.trim()}
              className="absolute top-0 right-0 rounded-tl-none rounded-bl-none"
              type="submit"
              onClick={handleCreateItem}
              size="icon"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Add to inbox</span>
            </Button>
          </div>

          {showInbox ? (
            <div>
              {/* Replace Tabs with segmented control */}
              <div 
                className="flex items-center mb-6 w-fit"
                role="tablist"
                aria-label="Filter inbox items"
              >
                <Button
                  variant={filter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === 'all' && 'text-primary'
                  )}
                  role="tab"
                  aria-selected={filter === 'all'}
                  aria-controls="all-items-tab"
                  id="all-tab"
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                  <span>All</span>
                  <span className="sr-only">{getItemCount('all')} items</span>
                </Button>
                <Button
                  variant={filter === 'task' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('task')}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === 'task' && 'text-primary'
                  )}
                  role="tab"
                  aria-selected={filter === 'task'}
                  aria-controls="tasks-tab"
                  id="tasks-tab"
                >
                  <Dot className="h-4 w-4" aria-hidden="true" />
                  <span>Tasks</span>
                  <span className="sr-only">{getItemCount('task')} tasks</span>
                </Button>
                <Button
                  variant={filter === 'resource' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('resource')}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === 'resource' && 'text-primary'
                  )}
                  role="tab"
                  aria-selected={filter === 'resource'}
                  aria-controls="resources-tab"
                  id="resources-tab"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  <span>Links</span>
                  <span className="sr-only">{getItemCount('resource')} links</span>
                </Button>
                <Button
                  variant={filter === 'thought' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('thought')}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === 'thought' && 'text-primary'
                  )}
                  role="tab"
                  aria-selected={filter === 'thought'}
                  aria-controls="thoughts-tab"
                  id="thoughts-tab"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                  <span>Notes</span>
                  <span className="sr-only">{getItemCount('thought')} notes</span>
                </Button>
              </div>

              <div 
                role="tabpanel"
                id={`${filter}-items-tab`}
                aria-labelledby={`${filter}-tab`}
                tabIndex={0}
              >
                <Table>
                  <TableBody>
                    {sortedDates.length > 0 ? (
                      sortedDates.map(dateKey => {
                        // Filter items for this date based on the current filter
                        const dateItems = groupedItems[dateKey].filter(item => {
                          if (filter === 'all') return true;
                          return item.type === filter;
                        });

                        if (dateItems.length === 0) return null;

                        return (
                          <React.Fragment key={dateKey}>
                            {/* Date header row */}
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="bg-muted/30 py-1 px-4 text-xs font-semibold text-muted-foreground"
                              >
                                {formatDate(dateKey)}
                              </TableCell>
                            </TableRow>
                            
                            {/* Items for this date */}
                            {dateItems.map((item) => (
                              <TableRow
                                className="group grid grid-cols-[auto_1fr_auto] items-center"
                                key={`${item.type}-${item.id}`}
                              >
                                <TableCell className="w-8">
                                  {item.type === "task" ? (
                                    // <Checkbox
                                    //   checked={item.complete}
                                    //   onCheckedChange={() =>
                                    //     handleToggleTask(
                                    //       item.id as number,
                                    //       item.complete || false
                                    //     )
                                    //   }
                                    // />
                                    <Dot className="h-4 w-4 text-muted-foreground" />
                                  ) : item.type === "resource" ? (
                                    <Link2 className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Minus className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </TableCell>
                                <TableCell className="flex items-center gap-2">
                                  {item.type === "task" ? (
                                    <span
                                      className={`mr-2 ${
                                        item.complete
                                          ? "line-through text-muted-foreground"
                                          : ""
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                  ) : item.type === "resource" ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="grid items-center gap-2 hover:underline"
                                      style={{
                                        gridTemplateColumns: item.url
                                          ? "16px 1fr"
                                          : "1fr",
                                      }}
                                    >
                                      {item.url ? (
                                        <img
                                          src={getFaviconFromUrl(item.url)}
                                          alt="Favicon"
                                          className="mt-0.5 w-4 h-4 bg-secondary rounded-sm"
                                        />
                                      ) : null}
                                      <span className="line-clamp-2 text-sm">
                                        {item.title}
                                      </span>
                                    </a>
                                  ) : (
                                    <div className="flex flex-col">
                                      <span className="text-sm">{item.content}</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 flex items-center justify-end gap-2">
                                    {item.type !== "thought" && (
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
                                                onClick={() =>
                                                  handleMoveItem(item, project.id)
                                                }
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
                                            if (item.type === "task")
                                              handleDeleteTask(item.id as number);
                                            else if (item.type === "resource")
                                              handleDeleteResource(item.id as number);
                                            else handleDeleteThought(item.id as string);
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
                          </React.Fragment>
                        );
                      })
                    ) : (
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
