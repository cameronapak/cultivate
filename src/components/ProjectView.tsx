import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Project, Task, Resource } from "../types";
import {
  deleteProject,
  createTask,
  updateTaskStatus,
  updateTask,
  updateProject,
  createResource,
  updateResource,
  deleteResource,
  deleteTask,
} from "wasp/client/operations";
import { Trash, Pencil, ExternalLink, Plus, Trash2, Settings2Icon, CheckIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import { getFaviconFromUrl } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { FormEvent, useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { CircleCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "./ui/toggle";
import { Switch } from "./ui/switch";

const EditTaskForm = ({
  task,
  onSave,
  onCancel,
}: {
  task: Task;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const formSchema = z.object({
    title: z.string().min(1, { message: "Task title is required" }),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
    },
  });
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateTask({
        id: task.id,
        title: form.getValues("title"),
        description: form.getValues("description"),
      });
      toast.success("Task updated successfully");
      onSave();
    } catch (err: any) {
      toast.error("Error updating task: " + err.message);
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Task title" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="text-gray-500"
                  placeholder="Task description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-4 items-center">
          <Button size="sm" type="submit" variant="default">
            Save Changes
          </Button>
          <Button size="sm" type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

const TaskItem = ({ task }: { task: Task }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusChange = async (complete: boolean) => {
    try {
      await updateTaskStatus({ id: task.id, complete });
      toast.success(
        `"${task.title}" ${complete ? "completed" : "marked as todo"}`
      );
    } catch (err: any) {
      toast.error("Error updating task: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteTask({ id: task.id });
        toast.success("Task deleted successfully");
      }
    } catch (err: any) {
      toast.error("Error deleting task: " + err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <EditTaskForm
        task={task}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={`group task-item ${task.complete ? "completed" : ""}`}>
      <div className="flex items-center space-x-2 justify-between">
        <div className="flex items-start space-x-2">
          <Checkbox
            id={task.id.toString()}
            checked={task.complete}
            onCheckedChange={(checked) => handleStatusChange(checked === true)}
          />
          <div className="flex flex-col">
            <label
              htmlFor={task.id.toString()}
              className="pointer-events-none text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {task.title}
            </label>
            {task.description && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto">
          <Button onClick={handleEdit} variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button onClick={handleDelete} variant="ghost" size="icon">
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NewTaskForm = ({ projectId }: { projectId: number }) => {
  const [isAdding, setIsAdding] = useState(false);

  const formSchema = z.object({
    title: z.string().min(1, { message: "Task title is required" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTask({
        title: values.title,
        description: values.description,
        projectId,
      });
      toast.success("Task created successfully");
      form.reset();
    } catch (err: any) {
      toast.error("Error creating task: " + err.message);
    }
  }

  if (!isAdding) {
    return (
      <Button size="sm" onClick={() => setIsAdding(true)} variant="outline">
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Task title" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="text-gray-500"
                  placeholder="Task description (optional)"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-4 items-center">
          <Button size="sm" type="submit" variant="default">
            Add
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => setIsAdding(false)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

const EditProjectForm = ({
  project,
  onSave,
  onCancel,
}: {
  project: Project;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await updateProject({
        id: project.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
      });
      toast.success("Project updated successfully");
      onSave();
    } catch (err: any) {
      toast.error("Error updating project: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4 className="heading-3">Edit Project</h4>

      <div>
        <label>
          Project Title *
          <Input
            name="title"
            required
            defaultValue={project.title}
            placeholder="Give your project a clear title"
          />
        </label>

        <label>
          Description
          <Input
            name="description"
            defaultValue={project.description || ""}
            placeholder="Brief overview of the project"
          />
        </label>
      </div>

      <div>
        <Button type="submit" variant="default">
          Save Changes
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ResourceItem = ({
  resource,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  let faviconUrl: string | null = null;
  let url = resource.url;
  try {
    const urlObj = new URL(resource.url);
    faviconUrl = getFaviconFromUrl(urlObj.origin, 64);
    url = urlObj.hostname;
  } catch (err) {
    console.error(err);
  }

  return (
    <TableRow className="w-full">
      <TableCell className="flex justify-between w-full">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <div className="flex gap-2">
            {faviconUrl && (
              <img src={faviconUrl} alt="Favicon" className="mt-0.5 w-4 h-4" />
            )}
            <div className="flex flex-col">
              <p className="text-sm hover:underline">{resource.title}</p>
              {resource.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>
            <ExternalLink className="mt-0.5 w-4 h-4 text-gray-500" />
          </div>
        </a>
        <div className="flex">
          <Button onClick={onEdit} variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button onClick={onDelete} variant="ghost" size="icon">
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const NewResourceForm = ({
  projectId,
  onSave,
  onCancel,
}: {
  projectId: number;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    url: z.string().url({ message: "Please enter a valid URL" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createResource({
        title: values.title,
        url: values.url,
        description: values.description,
        projectId,
      });
      toast.success("Resource added successfully");
      form.reset();
      onSave();
    } catch (err: any) {
      toast.error("Error creating resource: " + err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Resource title or name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this resource (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-4">
          <PopoverClose asChild>
            <Button type="submit" variant="default">
              Add Resource
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </PopoverClose>
        </div>
      </form>
    </Form>
  );
};

const EditResourceForm = ({
  resource,
  onSave,
  onCancel,
}: {
  resource: Resource;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    url: z.string().url({ message: "Please enter a valid URL" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource.title,
      url: resource.url,
      description: resource.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateResource({
        id: resource.id,
        title: values.title,
        url: values.url,
        description: values.description,
      });
      toast.success("Resource updated successfully");
      onSave();
    } catch (err: any) {
      toast.error("Error updating resource: " + err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  autoFocus
                  placeholder="Resource title or name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this resource (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 mt-4">
          <Button type="submit" variant="default">
            Save Changes
          </Button>
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ResourcesSection = ({ project }: { project: Project }) => {
  const [editingResourceId, setEditingResourceId] = useState<number | null>(
    null
  );

  const handleDeleteResource = async (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource({ id: resourceId });
        toast.success("Resource deleted successfully");
      } catch (err: any) {
        toast.error("Error deleting resource: " + err.message);
      }
    }
  };

  return (
    <div>
      {project.resources && project.resources.length > 0 ? (
        <Table>
          <TableBody>
            {project.resources.map((resource: Resource) =>
              editingResourceId === resource.id ? (
                <TableRow key={resource.id}>
                  <TableCell colSpan={2} className="bg-white">
                    <EditResourceForm
                      key={resource.id}
                      resource={resource}
                      onSave={() => setEditingResourceId(null)}
                      onCancel={() => setEditingResourceId(null)}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  onEdit={() => setEditingResourceId(resource.id)}
                  onDelete={() => handleDeleteResource(resource.id)}
                />
              )
            )}
          </TableBody>
        </Table>
      ) : (
        <p className="paragraph">
          No resources yet. Add links to helpful websites, documents, and other
          references.
        </p>
      )}
    </div>
  );
};

const AboutForm = ({
  project,
  onSave,
}: {
  project: Project;
  onSave: () => void;
}) => {
  const formSchema = z.object({
    title: z.string().min(1, { message: "Project title is required" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project.title,
      description: project.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProject({
        id: project.id,
        title: values.title,
        description: values.description,
      });
      toast.success("Project updated successfully");
      onSave();
    } catch (err: any) {
      toast.error("Error updating project: " + err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter project title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter project description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
};

export const ProjectView = ({ project }: { project: Project }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const navigate = useNavigate();

  // Initialize from URL query parameters
  const hideCompletedTasks = searchParams.get("hideCompleted") === "true";
  const activeTab = searchParams.get("tab");
  const currentTab =
    activeTab === "tasks" || activeTab === "resources" || activeTab === "about"
      ? activeTab
      : "tasks";

  const handleHideCompletedChange = (hide: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (hide) {
      newParams.set("hideCompleted", "true");
    } else {
      newParams.delete("hideCompleted");
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (tab: "tasks" | "resources" | "about") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject({ id: project.id });
        toast.success("Project deleted successfully");
        navigate("/");
      } catch (err: any) {
        toast.error("Error deleting project: " + err.message);
      }
    }
  };

  // Filter tasks based on the hideCompletedTasks state
  const filteredTasks = project.tasks?.filter(
    (task: Task) => !hideCompletedTasks || !task.complete
  );

  if (isEditing) {
    return (
      <div>
        <EditProjectForm
          project={project}
          onSave={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <main>
      <h1 className="text-2xl font-bold pb-6">{project.title}</h1>
      <Tabs
        defaultValue={currentTab}
        className="w-[400px]"
        onValueChange={(value) =>
          handleTabChange(value as "tasks" | "resources" | "about")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <CircleCheckIcon className="w-4 h-4" />
                      {project.tasks?.filter((task) => !task.complete).length} tasks remaining
                    </CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Settings2Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="flex items-center justify-between space-x-2">
                        <label htmlFor="hide-completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Hide Completed Tasks
                        </label>
                        <Switch
                          id="hide-completed"
                          checked={hideCompletedTasks}
                          onCheckedChange={handleHideCompletedChange}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {filteredTasks && filteredTasks.length > 0 ? (
                      <>
                        {filteredTasks.map((task: Task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <TaskItem key={task.id} task={task} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell>
                          <p className="text-sm text-gray-500">
                            {project.tasks && project.tasks.length > 0
                              ? "All tasks are completed and/or hidden."
                              : "No tasks yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell className="bg-white p-0 pt-4">
                        <NewTaskForm projectId={project.id} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Resources</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      {project.resources?.length || 0} resource(s)
                    </CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" onClick={() => setIsAddingResource(true)} variant="outline">
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <NewResourceForm
                        projectId={project.id}
                        onSave={() => setIsAddingResource(false)}
                        onCancel={() => setIsAddingResource(false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                <ResourcesSection project={project} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Update your project information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AboutForm project={project} onSave={() => {}} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete the project "{project.title}" and all of its
                        tasks and resources.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
