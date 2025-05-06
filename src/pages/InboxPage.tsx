import React, { useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInboxTasks,
  getInboxResources,
  useQuery,
  getInboxThoughts,
  useAction,
  sendTaskAway,
  sendResourceAway,
  sendThoughtAway,
} from "wasp/client/operations";
import type { Task, Resource, Thought } from "wasp/entities";
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
import {
  MoveRight,
  Eye,
  EyeClosed,
  // ExternalLink,
  Send,
  Link2,
  Minus,
  List,
  Square,
  Pencil,
  Trash,
  PackageOpen,
  Package,
  Folder,
  PartyPopper,
  ArchiveRestore,
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
import { getMetadataFromUrl, isUrl } from "../lib/utils";
import { cn } from "../lib/utils";
import { Combobox } from "../components/custom/ComboBox";
import { ItemRow, DisplayItem } from "../components/common/ItemRow";
import {
  EditTaskForm,
  EditResourceForm,
  EditThoughtForm,
} from "../components/ProjectView";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "../hooks/use-mobile";
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

// Add this type for tab data
type TabData = {
  id: InboxFilter;
  label: string;
  icon: React.ReactNode;
};

// Add this constant for tab data
const tabs: TabData[] = [
  { id: "all", label: "All", icon: <List className="h-4 w-4" /> },
  { id: "task", label: "Tasks", icon: <Square className="h-4 w-4" /> },
  { id: "resource", label: "Links", icon: <Link2 className="h-4 w-4" /> },
  { id: "thought", label: "Notes", icon: <Minus className="h-4 w-4" /> },
];

async function updateItemAwayStatus(item: DisplayItem, isAway: boolean) {
  if (item.type === "task") {
    return updateTask({
      id: item.id as number,
      isAway: isAway,
    });
  } else if (item.type === "resource") {
    return updateResource({
      id: item.id as number,
      isAway: isAway,
    });
  } else if (item.type === "thought") {
    return updateThought({
      id: item.id as string,
      isAway: isAway,
    });
  }

  return null;
}

function getRestoreItemObject(item: DisplayItem) {
  const isAttachedToProject = item.projectId !== null;
  let label = "Restore to Inbox";
  let tooltip = "Restore to Inbox";
  let icon = <ArchiveRestore className="h-5 w-5" />;

  if (isAttachedToProject) {
    label = "Restore to Project";
    tooltip = "Restore to Project";
    icon = <PackageOpen className="h-5 w-5" />;
  }

  return {
    icon,
    label,
    tooltip,
    onClick: async () => {
      await updateItemAwayStatus(item, false);
      toast.success(
        `Item restored to ${isAttachedToProject ? "Project" : "Inbox"}`
      );
    },
    show: () => true,
  };
}

export function InboxPage() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const isShowingAwayItems = searchParams.get("away") === "true";
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery(getInboxTasks, { isAway: isShowingAwayItems });
  const {
    data: resources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery(getInboxResources, { isAway: isShowingAwayItems });
  const {
    data: thoughts,
    isLoading: isLoadingThoughts,
    error: thoughtsError,
  } = useQuery(getInboxThoughts, { isAway: isShowingAwayItems });
  const { data: projects } = useQuery(getProjects);
  const activeItemId = searchParams.get("resource");
  const activeItemType = searchParams.get("type");
  const [newItemText, setNewItemText] = useState("");
  const [isThought, setIsThought] = useState(false);
  const [showInbox, setShowInbox] = useState(() => {
    const shouldShowTheAwayItems = searchParams.get("away") === "true";
    const activeItemIdExists = Boolean(searchParams.get("resource"));
    return shouldShowTheAwayItems || activeItemIdExists;
  });
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [editingItemId, setEditingItemId] = useState<{
    id: string | number | null;
    type: string;
  } | null>(null);
  const [previousFilter, setPreviousFilter] = useState<InboxFilter>(filter);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewAnswers, setReviewAnswers] = useState<{
    [key: string]: {
      meaning: string;
      actionable: boolean | null;
      twoMinutes: boolean | null;
    };
  }>({});

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+I (Mac) or CTRL+I (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();

        // This will restore the inbox view and cause the inbox
        // input to be in focus.
        if (isShowingAwayItems) {
          searchParams.delete("away");
          setSearchParams(searchParams);
        }

        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Add optimistic updates for tasks
  const createTaskOptimistically = useAction(createTask, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxTasks,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          const newTask = {
            id: Date.now(), // Temporary ID
            title: payload.title,
            description: payload.description,
            complete: false,
            status: "TODO",
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: null,
            type: "task" as const,
          };
          return [...(oldData || []), newTask];
        },
      },
    ],
  });

  const updateTaskOptimistically = useAction(updateTask, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxTasks,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          return (oldData || []).map((task: Task & { type: "task" }) =>
            task.id === payload.id
              ? { ...task, ...payload, updatedAt: new Date() }
              : task
          );
        },
      },
    ],
  });

  const deleteTaskOptimistically = useAction(deleteTask, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxTasks,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          return (oldData || []).filter(
            (task: Task & { type: "task" }) => task.id !== payload.id
          );
        },
      },
    ],
  });

  // Add optimistic updates for resources
  const createResourceOptimistically = useAction(createResource, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This iss the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxResources,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          const newResource = {
            id: Date.now(), // Temporary ID
            title: payload.title,
            url: payload.url,
            description: payload.description,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: null,
            type: "resource" as const,
          };
          return [...(oldData || []), newResource];
        },
      },
    ],
  });

  const updateResourceOptimistically = useAction(updateResource, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxResources,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          return (oldData || []).map(
            (resource: Resource & { type: "resource" }) =>
              resource.id === payload.id
                ? { ...resource, ...payload, updatedAt: new Date() }
                : resource
          );
        },
      },
    ],
  });

  const deleteResourceOptimistically = useAction(deleteResource, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxResources,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          return (oldData || []).filter(
            (resource: Resource & { type: "resource" }) =>
              resource.id !== payload.id
          );
        },
      },
    ],
  });

  const createThoughtOptimistically = useAction(createThought, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [
          // @ts-ignore: This is the correct way to approach this, so I'm not sure why it's erroring out.
          getInboxThoughts,
          { isAway: isShowingAwayItems },
        ],
        updateQuery: (payload, oldData) => {
          const newThought = {
            id: Date.now().toString(), // Temporary ID
            content: payload.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: null,
            type: "thought" as const,
            title:
              payload.content.slice(0, 60) +
              (payload.content.length > 60 ? "..." : ""),
          };
          return [...(oldData || []), newThought];
        },
      },
    ],
  });

  const handleToggleTasks = () => {
    setShowInbox((prev: boolean) => {
      localStorage.setItem("shouldShowTasks", (!prev).toString());
      return !prev;
    });
    setIsInitialRender(true);
  };

  const handleToggleAwayItems = () => {
    if (isShowingAwayItems) {
      searchParams.delete("away");
    } else {
      searchParams.set("away", "true");
    }
    setSearchParams(searchParams);
    setIsInitialRender(true);
  };

  const handleToggleIsThought = () => {
    setIsThought((prev) => !prev);
  };

  const handleCreateItem = async () => {
    if (!newItemText.trim()) {
      return;
    }

    try {
      // Always check for URL first, regardless of mode
      if (isUrl(newItemText.trim())) {
        const url = newItemText.trim();
        const resource = await createResourceOptimistically({
          title: url,
          url: url,
          description: "",
          // No projectId means it goes to inbox
        });
        toast.success("Resource created!");
        if (resource) {
          // Now, let's update the resource
          const metadata = await getMetadataFromUrl(newItemText.trim());
          await updateResourceOptimistically({
            id: resource.id,
            title: metadata.title || url,
            url: url,
            description: metadata.description || "",
          });
        }
      } else if (isThought) {
        // Create a thought
        await createThoughtOptimistically({
          content: newItemText,
        });
        toast.success(`Thought captured!`);
      } else {
        // Create a regular task
        await createTaskOptimistically({
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
        if (item.type === "task") {
          await deleteTaskOptimistically({ id: item.id as number });
        } else if (item.type === "resource") {
          await deleteResourceOptimistically({ id: item.id as number });
        } else if (item.type === "thought") {
          await deleteThought({ id: item.id as string });
        }
        toast.success(
          `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted`
        );
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
      toast.success(
        `${
          item.type.charAt(0).toUpperCase() + item.type.slice(1)
        } moved to project`
      );
    } catch (error) {
      console.error(`Failed to move ${item.type}:`, error);
      toast.error(`Failed to move ${item.type}`);
    }
  };

  const handleEditItem = (item: DisplayItem) => {
    setEditingItemId({
      id: item.id,
      type: item.type,
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveItem = async (item: DisplayItem, values: any) => {
    try {
      if (item.type === "task") {
        await updateTaskOptimistically({
          id: item.id as number,
          title: values.title,
          description: values.description,
        });
        toast.success("Task updated");
      } else if (item.type === "resource") {
        await updateResourceOptimistically({
          id: item.id as number,
          title: values.title,
          url: values.url,
          description: values.description,
        });
        toast.success("Resource updated");
      } else if (item.type === "thought") {
        await updateThought({ id: item.id as string, content: values.content });
        toast.success("Thought updated");
      }
      setEditingItemId(null);
    } catch (error) {
      console.error(`Failed to update ${item.type}:`, error);
      toast.error(`Failed to update ${item.type}`);
    }
  };

  // Function to render the correct edit form based on item type
  const renderItemEditForm = (
    item: DisplayItem,
    onSave: (values: any) => void,
    onCancel: () => void
  ) => {
    if (item.type === "task") {
      // Assuming EditTaskForm is imported and accepts Task
      return (
        <EditTaskForm task={item as Task} onSave={onSave} onCancel={onCancel} />
      );
    } else if (item.type === "resource") {
      // Assuming EditResourceForm is imported and accepts Resource
      return (
        <EditResourceForm
          resource={item as Resource}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    } else if (item.type === "thought") {
      // Need an EditThoughtForm component
      return (
        <EditThoughtForm
          thought={item as Thought}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
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
          title:
            thought.content.slice(0, 60) +
            (thought.content.length > 60 ? "..." : ""),
          type: "thought" as const,
          createdAt: new Date(thought.createdAt), // Ensure it's a Date object
        })) || []),
      ]
        .filter((item) => (filter !== "all" ? filter === item.type : true))
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
        await deleteTaskOptimistically({ id: taskId as number });
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
  const handleCheckedChange = async (task: Task, checked: boolean) => {
    try {
      await updateTaskStatus({ id: task.id, complete: checked });
      // Optionally add a success toast here if desired
      toast.success(
        `Task "${task.title}" marked as ${checked ? "complete" : "incomplete"}`
      );
      // Wasp query cache should update automatically
    } catch (err) {
      toast.error("Failed to update task status");
    }
  };

  // Add this function to handle filter changes
  const handleFilterChange = (newFilter: InboxFilter) => {
    setPreviousFilter(filter);
    setFilter(newFilter);
    setIsInitialRender(false);
  };

  // Helper to get or initialize review state for an item
  const getReviewState = (itemId: string | number) => {
    return (
      reviewAnswers[itemId] || {
        meaning: "",
        actionable: null,
        twoMinutes: null,
      }
    );
  };

  // Handler to update review state for an item
  const setReviewState = (
    itemId: string | number,
    field: string,
    value: any
  ) => {
    setReviewAnswers((prev) => ({
      ...prev,
      [itemId]: {
        ...getReviewState(itemId),
        [field]: value,
      },
    }));
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
          url: "/inbox",
        },
        ...(isShowingAwayItems
          ? [
              {
                title: "Away",
                url: "/away",
              },
            ]
          : []),
      ]}
      ctaButton={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isShowingAwayItems}
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
      <AnimatePresence mode="wait">
        <div>
          <div>
            {isShowingAwayItems ? (
              <motion.div
                key="away"
                className="flex items-center gap-2 h-[36px] mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0 }}
              >
                <PackageOpen className="h-5 w-5 text-muted-foreground" />
                <h1 className="heading-1">Away</h1>
              </motion.div>
            ) : (
              <motion.div
                key="inbox"
                className="relative flex gap-4 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0 }}
              >
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
                  ref={inputRef}
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
              </motion.div>
            )}

            {showInbox && !isReviewing ? (
              <div>
                <div className="grid grid-cols-[1fr_auto] overflow-x-auto items-center justify-between gap-2 mb-6">
                  {/* Replace Tabs with segmented control */}
                  <div
                    className={cn(
                      "flex justify-start items-center w-fit gap-2"
                    )}
                    role="tablist"
                    aria-label="Filter inbox items"
                  >
                    {tabs.map((tab) => (
                      <motion.div
                        key={tab.id}
                        className="relative overflow-hidden rounded-full"
                        initial={false}
                        animate={{
                          width:
                            filter !== tab.id ? 32 : "calc-size(auto, size)",
                        }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.15,
                        }}
                      >
                        <Button
                          variant={filter === tab.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleFilterChange(tab.id)}
                          className={cn(
                            "relative rounded-full text-muted-foreground shadow-none px-3 pr-4",
                            filter === tab.id && "text-primary-foreground",
                            filter !== tab.id &&
                              "pr-0 pl-2 justify-start overflow-hidden"
                          )}
                          role="tab"
                          aria-selected={filter === tab.id}
                          aria-controls={`${tab.id}-items-tab`}
                          id={`${tab.id}-tab`}
                        >
                          {tab.icon}
                          <span
                            className={cn(
                              filter !== tab.id
                                ? "blur-sm opacity-0"
                                : "opacity-100 blur-none",
                              "transition-[transform,opacity] duration-500"
                            )}
                          >
                            {tab.label}
                          </span>
                          <span className="sr-only">
                            {getItemCount(tab.id)} items
                          </span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        disabled={!showInbox}
                        variant={isShowingAwayItems ? "default" : "outline"}
                        type="submit"
                        onClick={handleToggleAwayItems}
                        size="icon"
                      >
                        {isShowingAwayItems ? (
                          <PackageOpen className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isShowingAwayItems ? "Show inbox" : "Show away items"}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div
                  role="tabpanel"
                  id={`${filter}-items-tab`}
                  aria-labelledby={`${filter}-tab`}
                  tabIndex={0}
                  className="relative overflow-hidden"
                >
                  <motion.div
                    key={`${filter}-${isShowingAwayItems ? "away" : "inbox"}`}
                    initial={{
                      x: isInitialRender
                        ? 0
                        : tabs.findIndex((t) => t.id === filter) >
                          tabs.findIndex((t) => t.id === previousFilter)
                        ? "10%"
                        : "-10%",
                      position: "absolute",
                      width: "100%",
                      top: 0,
                      left: 0,
                      opacity: 0.2,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      position: "relative",
                      filter: "blur(0px)",
                    }}
                    exit={{
                      x:
                        tabs.findIndex((t) => t.id === filter) >
                        tabs.findIndex((t) => t.id === previousFilter)
                          ? "0"
                          : "0",
                      position: "absolute",
                      width: "100%",
                      top: 0,
                      left: 0,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
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
                                    hideDragHandle={true}
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    isEditing={
                                      editingItemId?.id === item.id &&
                                      editingItemId?.type === item.type
                                    }
                                    onCheckedChange={handleCheckedChange}
                                    isActive={
                                      item.type === activeItemType &&
                                      item.id.toString() === activeItemId
                                    }
                                    projects={projects}
                                    hideActions={false}
                                    renderEditForm={renderItemEditForm}
                                    onEdit={handleEditItem}
                                    onCancelEdit={handleCancelEdit}
                                    onUpdate={async (item) => {
                                      await handleSaveItem(item, item);
                                    }}
                                    actions={[
                                      // Edit
                                      {
                                        icon: <Pencil className="w-4 h-4" />,
                                        label: "Refine",
                                        tooltip: "Refine",
                                        onClick: () => handleEditItem(item),
                                      },
                                      // Move (if projects exist)
                                      projects && projects.length > 0
                                        ? ({
                                            icon: (
                                              <MoveRight className="h-4 w-4" />
                                            ),
                                            label: "Move",
                                            tooltip: "Move to Project",
                                            render: (item: DisplayItem) => (
                                              <Combobox
                                                button={
                                                  <Button
                                                    variant={
                                                      isMobile
                                                        ? "outline"
                                                        : "ghost"
                                                    }
                                                    size="icon"
                                                  >
                                                    <Folder className="h-4 w-4" />
                                                  </Button>
                                                }
                                                options={projects.map((p) => ({
                                                  label: p.title,
                                                  value: p.id.toString(),
                                                }))}
                                                onChange={async (
                                                  _projectTitle,
                                                  projectId
                                                ) => {
                                                  const projectIdInt = parseInt(
                                                    projectId,
                                                    10
                                                  );
                                                  if (!isNaN(projectIdInt))
                                                    handleMoveItem(
                                                      item,
                                                      projectIdInt
                                                    );
                                                }}
                                              />
                                            ),
                                            show: () =>
                                              projects && projects.length > 0,
                                          } as const)
                                        : undefined,
                                      // Send Away
                                      isShowingAwayItems
                                        ? // Make it where I can send to the inbox
                                          getRestoreItemObject(item)
                                        : {
                                            icon: (
                                              <Package className="h-5 w-5" />
                                            ),
                                            label: "Send Away",
                                            tooltip: "Send Away",
                                            onClick: async () => {
                                              if (item.type === "task") {
                                                await sendTaskAway({
                                                  id: item.id as number,
                                                });
                                              } else if (
                                                item.type === "resource"
                                              ) {
                                                await sendResourceAway({
                                                  id: item.id as number,
                                                });
                                              } else if (
                                                item.type === "thought"
                                              ) {
                                                await sendThoughtAway({
                                                  id: item.id as string,
                                                });
                                              }
                                              toast.success("Item sent Away");
                                            },
                                            show: () => true,
                                          },
                                      // Delete
                                      {
                                        icon: <Trash className="w-4 h-4" />,
                                        label: "Delete",
                                        tooltip: "Delete",
                                        onClick: () => handleDeleteItem(item),
                                        show: () => true,
                                      },
                                    ].filter(
                                      (a): a is NonNullable<typeof a> =>
                                        a !== undefined
                                    )}
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
                                Icon={<PartyPopper className="h-10 w-10" />}
                                title="Inbox Zero"
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ filter: "blur(4px)", opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="opacity-50 flex justify-center items-center h-full">
                  <EmptyStateView
                    Icon={<EyeClosed className="h-10 w-10" />}
                    title="Inbox is safely hidden"
                    description={
                      inboxItems.length > 0
                        ? "You have items ready for review"
                        : "Nothing to review"
                    }
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </AnimatePresence>
    </Layout>
  );
}
