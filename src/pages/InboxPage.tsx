import React, { useMemo } from "react";
import {
  getInboxTasks,
  getInboxResources,
  useQuery,
  getInboxThoughts,
} from "wasp/client/operations";
import type { Project, Task, Resource, Thought } from "wasp/entities";
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
  updateTask,
  updateThought,
  updateResource,
  moveThought,
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
  Square,
  ExternalLink,
  Heart,
  HandHeart,
} from "lucide-react";
import { getProjects } from "wasp/client/operations";
import { Table, TableBody, TableRow, TableCell } from "../components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Toggle } from "../components/ui/toggle";
import { Combobox } from "../components/custom/ComboBox";
import { ItemRow, DisplayItem } from "../components/common/ItemRow";
import { EditTaskForm, EditResourceForm, EditThoughtForm } from "../components/ProjectView";

// Create a type where the string is a date in the format "2025-04-20"
type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

// Add this helper function to format dates consistently
const formatDate = (date: Date | DateString): string => {
  // Convert to Date object if it's a string
  const itemDate =
    typeof date === "string"
      ? new Date(date + "T00:00:00") // Add time component to ensure consistent timezone handling
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
  const yesterdayTime = nowTime - 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (itemTime === yesterdayTime) {
    return "Yesterday";
  }

  // For other dates, use native date formatting
  return itemDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

// Add this type for grouped items
type GroupedInboxItems = {
  [key: DateString]: DisplayItem[];
};

// Add this type for filter options
type InboxFilter = "all" | "task" | "resource" | "thought";

// Add these types after the InboxItem type
type TaskReviewState = {
  isVital: boolean | null;
  doesMatter: boolean | null;
  notes: string;
  showContext: boolean;
};

type TaskReviewDialogProps = {
  task: DisplayItem;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (
    taskId: number | string,
    decision: "keep" | "defer" | "discard",
    notes: string
  ) => void;
  projects: Project[];
};

const TaskReviewDialog = ({
  task,
  isOpen,
  onClose,
  onComplete,
  projects,
}: TaskReviewDialogProps) => {
  const [reviewState, setReviewState] = useState<TaskReviewState>({
    isVital: null,
    doesMatter: null,
    notes: "",
    showContext: false,
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleDecision = (decision: "keep" | "defer" | "discard") => {
    onComplete(task.id, decision, reviewState.notes);
    setReviewState({
      isVital: null,
      doesMatter: null,
      notes: "",
      showContext: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task.title}
          </DialogTitle>
          {/* <Input
            type="text"
            value={task.title}
          /> */}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Toggle variant="outline">
            <Heart className="h-4 w-4" />
            This task is vital
          </Toggle>
          <Toggle variant="outline">
            <HandHeart className="h-4 w-4" />
            This task matters
          </Toggle>
        </div>

        {/* I want to have a combobox to select a project */}
        {/* <Combobox
          options={projects?.map((project) => ({
            label: project.title,
            value: project.id.toString(),
          }))}
          value={selectedProjectId || ""}
          onChange={setSelectedProjectId}
          placeholder="Select a project"
        /> */}

        {/* <DialogFooter className="flex justify-center gap-2">
          <Button
            variant="default"
            onClick={() => handleDecision("keep")}
            disabled={
              reviewState.isVital === null || reviewState.doesMatter === null
            }
          >
            <Check className="h-4 w-4 mr-2" />
            Keep
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDecision("defer")}
            disabled={
              reviewState.isVital === null || reviewState.doesMatter === null
            }
          >
            <Clock className="h-4 w-4 mr-2" />
            Defer
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDecision("discard")}
            disabled={
              reviewState.isVital === null || reviewState.doesMatter === null
            }
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Discard
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

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
  } = useQuery(getInboxThoughts);
  const { data: projects } = useQuery(getProjects);
  const [newItemText, setNewItemText] = useState("");
  const [isThought, setIsThought] = useState(false);
  const [showInbox, setShowInbox] = useState(() => {
    const showTasksLocalStorage = JSON.parse(
      localStorage.getItem("shouldShowTasks") || "true"
    );
    return showTasksLocalStorage;
  });
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [editingItemId, setEditingItemId] = useState<{ id: string | number | null, type: string } | null>(null);

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

  const handleToggleTask = async (item: Task, currentStatus: boolean) => {
    try {
      await updateTaskStatus({
        id: item.id,
        complete: !currentStatus,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteItem = async (item: DisplayItem) => {
    const confirmMessage = `Are you sure you want to delete this ${item.type}?`;
    if (confirm(confirmMessage)) {
      try {
        if (item.type === 'task') {
          await deleteTask({ id: item.id as number });
        } else if (item.type === 'resource') {
          await deleteResource({ id: item.id as number });
        } else if (item.type === 'thought') {
          await deleteThought({ id: item.id as string });
        }
        toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted`);
      } catch (error) {
        console.error(`Failed to delete ${item.type}:`, error);
        toast.error(`Failed to delete ${item.type}`);
      }
    }
  };

  const handleMoveItem = async (item: DisplayItem, projectId: number) => {
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
      } else if (item.type === "thought") {
        await moveThought({
          thoughtId: item.id as string,
          projectId,
        });
      }
      toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} moved to project`);
    } catch (error) {
      console.error(`Failed to move ${item.type}:`, error);
      toast.error(`Failed to move ${item.type}`);
    }
  };

  const handleEditItem = (item: DisplayItem) => {
    setEditingItemId({
      id: item.id,
      type: item.type
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveItem = async (item: DisplayItem, values: any) => {
    try {
      if (item.type === 'task') {
        await updateTask({ id: item.id as number, title: values.title, description: values.description });
        toast.success("Task updated");
      } else if (item.type === 'resource') {
        // Assuming EditResourceForm provides title, url, description
        await updateResource({ id: item.id as number, title: values.title, url: values.url, description: values.description });
        toast.success("Resource updated");
      } else if (item.type === 'thought') {
        // Add thought update logic if an EditThoughtForm exists and is used
         await updateThought({ id: item.id as string, content: values.content });
         toast.success("Thought updated");
      }
      setEditingItemId(null); // Exit edit mode on success
    } catch (error) {
      console.error(`Failed to update ${item.type}:`, error);
      toast.error(`Failed to update ${item.type}`);
      // Optionally keep editing mode open on error, or provide more specific feedback
    }
  };
  
  // Function to render the correct edit form based on item type
  const renderItemEditForm = (item: DisplayItem, onSave: (values: any) => void, onCancel: () => void) => {
    if (item.type === 'task') {
      // Assuming EditTaskForm is imported and accepts Task
      return <EditTaskForm task={item as Task} onSave={onSave} onCancel={onCancel} />;
    } else if (item.type === 'resource') {
      // Assuming EditResourceForm is imported and accepts Resource
      return <EditResourceForm resource={item as Resource} onSave={onSave} onCancel={onCancel} />;
    } else if (item.type === 'thought') {
      // Need an EditThoughtForm component
      return <EditThoughtForm thought={item as Thought} onSave={onSave} onCancel={onCancel} />;
    }
    return null; // Or a placeholder/message for types without an edit form
  };

  // Group items by date
  const groupItemsByDate = (items: DisplayItem[]): GroupedInboxItems => {
    const grouped: GroupedInboxItems = {};

    items.forEach((item) => {
      // Format date as YYYY-MM-DD for consistent grouping, using local timezone
      const date = new Date(item.createdAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}` as DateString;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  };

  // Transform tasks, resources, and thoughts into a common DisplayItem shape
  const inboxItems: DisplayItem[] = useMemo(
    () =>
      [
        ...(tasks?.map((task) => ({
          ...task,
          type: "task" as const,
          createdAt: new Date(task.createdAt), // Ensure it's a Date object
        })) || []),
        ...(resources?.map((resource) => ({
          ...resource,
          type: "resource" as const,
          createdAt: new Date(resource.createdAt), // Ensure it's a Date object
        })) || []),
        ...(thoughts?.map((thought) => ({
          ...thought,
          title: thought.content.slice(0, 60) + (thought.content.length > 60 ? "..." : ""), 
          type: "thought" as const,
          createdAt: new Date(thought.createdAt), // Ensure it's a Date object
        })) || []),
      ]
      .filter((item) => filter !== 'all' ? filter === item.type : true)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [tasks, resources, thoughts, filter]
  );

  // Group items by date
  const groupedItems = groupItemsByDate(inboxItems);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedItems)
    .sort()
    .reverse() as DateString[];

  // Add this function to get item counts
  const getItemCount = (type: InboxFilter) => {
    if (type === "all") return inboxItems.length;
    return inboxItems.filter((item) => item.type === type).length;
  };

  // Add this handler after other handlers
  const handleTaskReviewComplete = async (
    taskId: number | string,
    decision: "keep" | "defer" | "discard",
    notes: string
  ) => {
    try {
      if (decision === "discard") {
        await deleteTask({ id: taskId as number });
        toast.success("Task discarded");
      } else if (decision === "defer") {
        // You might want to implement defer logic here
        toast.success("Task deferred");
      } else {
        // For "keep", you might want to mark it as complete or move it to a project
        await updateTaskStatus({ id: taskId as number, complete: true });
        toast.success("Task kept and marked as complete");
      }
    } catch (error) {
      console.error("Failed to process task:", error);
      toast.error("Failed to process task");
    }
  };

  // Add handler for status change
  const handleStatusChange = async (task: Task, complete: boolean) => {
    try {
      await updateTaskStatus({ id: task.id, complete });
      // Optionally add a success toast here if desired
      toast.success(`Task "${task.title}" marked as ${complete ? 'complete' : 'incomplete'}`);
      // Wasp query cache should update automatically
    } catch (err) {
      toast.error("Failed to update task status");
    }
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
    itemTypeButton = <Square className="h-4 w-4" />;
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
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" onClick={startReviewingTasks}>
            Review tasks
          </Button> */}

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
        </div>
      }
    >
      <div>
        <div>
          {/* {showReviewDialog && reviewingTask && projects?.length ? (
            <TaskReviewDialog
              task={reviewingTask}
              isOpen={showReviewDialog}
              onClose={() => {
                setReviewingTask(null);
                setShowReviewDialog(false);
              }}
              projects={projects}
              onComplete={handleTaskReviewComplete}
            />
          ) : null} */}

          <div className="relative flex gap-4 mb-6">
            <Button
              className="absolute shadow-none top-0 left-0 text-muted-foreground rounded-tr-none rounded-br-none"
              size="icon"
              variant="outline"
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
              placeholder={
                isThought ? "Add a thought or URL..." : "Add a task..."
              }
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-11 flex-1 pr-10"
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
                  variant={filter === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === "all" && "text-primary"
                  )}
                  role="tab"
                  aria-selected={filter === "all"}
                  aria-controls="all-items-tab"
                  id="all-tab"
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                  <span>All</span>
                  <span className="sr-only">{getItemCount("all")} items</span>
                </Button>
                <Button
                  variant={filter === "task" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("task")}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === "task" && "text-primary"
                  )}
                  role="tab"
                  aria-selected={filter === "task"}
                  aria-controls="tasks-tab"
                  id="tasks-tab"
                >
                  <Square className="h-4 w-4" aria-hidden="true" />
                  <span>Tasks</span>
                  <span className="sr-only">{getItemCount("task")} tasks</span>
                </Button>
                <Button
                  variant={filter === "resource" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("resource")}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === "resource" && "text-primary"
                  )}
                  role="tab"
                  aria-selected={filter === "resource"}
                  aria-controls="resources-tab"
                  id="resources-tab"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  <span>Links</span>
                  <span className="sr-only">
                    {getItemCount("resource")} links
                  </span>
                </Button>
                <Button
                  variant={filter === "thought" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("thought")}
                  className={cn(
                    "relative px-3 rounded-full text-muted-foreground shadow-none",
                    filter === "thought" && "text-primary"
                  )}
                  role="tab"
                  aria-selected={filter === "thought"}
                  aria-controls="thoughts-tab"
                  id="thoughts-tab"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                  <span>Notes</span>
                  <span className="sr-only">
                    {getItemCount("thought")} notes
                  </span>
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
                      sortedDates.map((dateKey) => {
                        // Filter items for this date based on the current filter
                        const dateItems = groupedItems[dateKey].filter(
                          (item) => {
                            if (filter === "all") return true;
                            return item.type === filter;
                          }
                        );

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
                              <ItemRow
                                key={`${item.type}-${item.id}`}
                                item={item}
                                isEditing={editingItemId?.id === item.id && editingItemId?.type === item.type}
                                projects={projects || []}
                                onEdit={handleEditItem}
                                onSave={handleSaveItem}
                                onCancelEdit={handleCancelEdit}
                                onDelete={handleDeleteItem}
                                onStatusChange={item.type === 'task' ? (taskItem, complete) => handleStatusChange(taskItem as Task, complete) : undefined}
                                onMove={handleMoveItem}
                                renderEditForm={renderItemEditForm}
                                hideDragHandle={true}
                              />
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
      {/* {reviewingTask && (
        <TaskReviewDialog
          task={reviewingTask}
          isOpen={!!reviewingTask}
          onClose={() => setReviewingTask(null)}
          onComplete={handleTaskReviewComplete}
          projects={projects || []}
        />
      )} */}
    </Layout>
  );
}
