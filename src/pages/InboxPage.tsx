import { Task, Resource } from "wasp/entities";
import { getInboxTasks, getInboxResources, useQuery } from "wasp/client/operations";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
  moveTask,
  createResource,
  deleteResource,
} from "wasp/client/operations";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Trash2, MoveRight, Eye, EyeClosed, Coffee, ExternalLink } from "lucide-react";
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

// Add URL detection utility function
const isUrl = (text: string): boolean => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

export function InboxPage() {
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useQuery(getInboxTasks);
  const { data: resources, isLoading: isLoadingResources, error: resourcesError } = useQuery(getInboxResources);
  const { data: projects } = useQuery(getProjects);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTasks, setShowTasks] = useState(() => {
    const showTasksLocalStorage = JSON.parse(localStorage.getItem("shouldShowTasks") || "true");
    return showTasksLocalStorage;
  });

  const handleToggleTasks = () => {
    setShowTasks((prev: boolean) => {
      localStorage.setItem("shouldShowTasks", (!prev).toString());
      return !prev;
    });
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      if (isUrl(newTaskTitle.trim())) {
        // Create a resource instead of a task
        await createResource({
          title: newTaskTitle.trim(),
          url: newTaskTitle.trim(),
          projectId: 0,
          // No projectId means it goes to inbox
        });
        toast.success(`Resource created: "${newTaskTitle}"`);
      } else {
        // Create a regular task
        await createTask({
          title: newTaskTitle,
          // No projectId means it goes to inbox
        });
        toast.success(`Task created: "${newTaskTitle}"`);
      }
      setNewTaskTitle("");
    } catch (error) {
      console.error("Failed to create task/resource:", error);
      toast.error("Failed to create task/resource");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateTask();
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

  const handleMoveTask = async (taskId: number, projectId: number) => {
    try {
      await moveTask({
        taskId,
        projectId,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
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

  const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (tasksError || resourcesError) {
    return <div>Error: {tasksError?.message || resourcesError?.message}</div>;
  }

  return (
    <Layout isLoading={isLoadingTasks || isLoadingResources} breadcrumbItems={[{ title: "Inbox" }]}>
      <div>
        <div className="flex flex-col gap-2 items-start mb-4">
          <div className="flex gap-2 items-center">
            <h1 className="heading-1">Inbox</h1>
            <Tooltip>
              <TooltipTrigger>
                <Toggle
                  variant="outline"
                  onClick={handleToggleTasks}
                >
                  {showTasks ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeClosed className="h-5 w-5" />
                  )}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {showTasks ? "Hide tasks" : "Show tasks"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div>
          <div className="flex gap-4 mb-6">
            <Input
              autoFocus={true}
              type="text"
              placeholder="Add a new task or paste a URL..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button variant="outline" onClick={handleCreateTask}>
              Add
            </Button>
          </div>

          {showTasks ? (
            <div>
              <Table>
                <TableBody>
                  {tasks?.map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell className="w-8">
                        <Checkbox
                          checked={task.complete}
                          onCheckedChange={() =>
                            handleToggleTask(task.id, task.complete)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`mr-2 ${
                            task.complete
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getDaysAgo(task.createdAt)
                            ? getDaysAgo(task.createdAt) +
                              " day" +
                              (getDaysAgo(task.createdAt) > 1 ? "s" : "") +
                              " ago"
                            : "today"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <MoveRight className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Move task to a project
                                </TooltipContent>
                              </Tooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {projects?.length ? (
                                projects?.map((project) => (
                                  <DropdownMenuItem
                                    key={project.id}
                                    onClick={() =>
                                      handleMoveTask(task.id, project.id)
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete task</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {resources?.map((resource: Resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="w-8">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:underline"
                        >
                          <span className="text-sm">{resource.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {getDaysAgo(resource.createdAt)
                              ? getDaysAgo(resource.createdAt) +
                                " day" +
                                (getDaysAgo(resource.createdAt) > 1 ? "s" : "") +
                                " ago"
                              : "today"}
                          </span>
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <MoveRight className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Move resource to a project
                                </TooltipContent>
                              </Tooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {projects?.length ? (
                                projects?.map((project) => (
                                  <DropdownMenuItem
                                    key={project.id}
                                    onClick={() =>
                                      handleMoveTask(resource.id, project.id)
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteResource(resource.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete resource</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasks?.length === 0 && resources?.length === 0 && !isLoadingTasks && !isLoadingResources && (
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
