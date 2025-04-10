import { FormEvent, useRef, useState, useEffect } from "react";
import {
  Project as BaseProject,
  Task as BaseTask,
  Resource as BaseResource,
} from "wasp/entities";
import { useSearchParams, Link } from "react-router-dom";
import {
  getProjects,
  useQuery,
  createProject,
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
import { Trash, Pencil, ExternalLink, Plus, Folder } from "lucide-react";
import "./Main.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Checkbox } from "./components/ui/checkbox";
import { Switch } from "./components/ui/switch";
import {
  Table,
  TableCaption,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { getFaviconFromUrl } from "./lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { AppSidebar } from "./components/custom/AppSidebar";
import { Separator } from "./components/ui/separator";
import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "./components/ui/breadcrumb";
import { CommandMenu } from "./components/custom/CommandMenu";

// Extended types with relationships
interface Task extends BaseTask {}

interface Resource extends BaseResource {}

interface Project extends BaseProject {
  tasks?: Task[];
  resources?: Resource[];
}

// New Project form schema
const projectFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Project title must be at least 2 characters." }),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const hideSidebar = searchParams.get("hideSidebar") === "true";

  return (
    <SidebarProvider open={!hideSidebar}>
      <CommandMenu />
      <AppSidebar
        items={[
          {
            isActive: true,
            title: "Projects",
            icon: Folder,
            items:
              projects?.map((project) => ({
                title: project.title,
                url: `/projects/${project.id}`,
              })) || [],
          },
        ]}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <NewProjectForm onCancel={() => {}} />
              </PopoverContent>
            </Popover>
          </div>

          {isLoading && <p>Loading projects...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(projects as Project[]).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="no-underline"
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      {project.description && (
                        <CardDescription>{project.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span>{project.tasks?.length || 0} tasks</span>
                        <span>•</span>
                        <span>{project.resources?.length || 0} resources</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500 mb-4">No projects yet</p>
                <Button onClick={() => setShowNewProjectForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            )
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const NewProjectForm = ({ onCancel }: { onCancel: () => void }) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    try {
      await createProject({
        title: values.title,
        description: values.description || "",
      });
      form.reset();
    } catch (err: any) {
      window.alert("Error: " + err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="heading-4">Create New Project</h2>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your project a clear title"
                  {...field}
                />
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
                <Input placeholder="Brief overview of the project" {...field} />
              </FormControl>
              <FormDescription>
                Optional description for this project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <PopoverClose asChild>
            <Button type="submit">Create Project</Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button
              type="button"
              onClick={() => form.reset()}
              variant="outline"
            >
              Cancel
            </Button>
          </PopoverClose>
        </div>
      </form>
    </Form>
  );
};

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
      onSave();
    } catch (err: any) {
      window.alert("Error updating task: " + err.message);
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
                <Textarea placeholder="Task description" {...field} />
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
    } catch (err: any) {
      window.alert("Error updating task: " + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteTask({ id: task.id });
      }
    } catch (err: any) {
      window.alert("Error deleting task: " + err.message);
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
    <div className={`task-item ${task.complete ? "completed" : ""}`}>
      <div className="flex items-center space-x-2 justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={task.id.toString()}
            checked={task.complete}
            onCheckedChange={(checked) => handleStatusChange(checked === true)}
          />
          <div className="flex flex-col">
            <label
              htmlFor={task.id.toString()}
              className="pointer-events-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
        <div className="flex">
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
      form.reset();
      setIsAdding(false);
    } catch (err: any) {
      window.alert("Error creating task: " + err.message);
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
                <Input placeholder="Task description (optional)" {...field} />
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

      onSave();
    } catch (err: any) {
      window.alert("Error: " + err.message);
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
      form.reset();
      onSave();
    } catch (err: any) {
      window.alert("Error creating resource: " + err.message);
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
      onSave();
    } catch (err: any) {
      window.alert("Error updating resource: " + err.message);
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
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(
    null
  );

  const handleDeleteResource = async (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await deleteResource({ id: resourceId });
      } catch (err: any) {
        window.alert("Error deleting resource: " + err.message);
      }
    }
  };

  return (
    <div className="mt-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button onClick={() => setIsAddingResource(true)} variant="outline">
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

      {project.resources && project.resources.length > 0 ? (
        <Table className="mt-4">
          <TableBody>
            {project.resources.map((resource) =>
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
        <p className="paragraph text-sm text-gray-500">
          No resources yet. Add links to helpful websites, documents, and other
          references.
        </p>
      )}
    </div>
  );
};

const ProjectView = ({ project }: { project: Project }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize from URL query parameters
  const hideCompletedTasks = searchParams.get("hideCompleted") === "true";
  const activeTab = searchParams.get("tab");
  const currentTab =
    activeTab === "tasks" || activeTab === "resources" ? activeTab : "tasks";

  const handleHideCompletedChange = (hide: boolean) => {
    setSearchParams((prev) => {
      prev.set("hideCompleted", hide ? "true" : "false");
      return prev;
    });
  };

  const handleTabChange = (tab: "tasks" | "resources" | "about") => {
    setSearchParams((prev) => {
      prev.set("tab", tab);
      return prev;
    });
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject({ id: project.id });
      } catch (err: any) {
        window.alert("Error deleting project: " + err.message);
      }
    }
  };

  // Filter tasks based on the hideCompletedTasks state
  const filteredTasks = project.tasks?.filter(
    (task) => !hideCompletedTasks || !task.complete
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
    <main className="mt-6">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle>{project.title}</CardTitle>
          {project.description && (
            <CardDescription className="text-start">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={currentTab}
            className="w-[400px]"
            onValueChange={(value) =>
              handleTabChange(value as "tasks" | "resources")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <div className="mt-4">
                <div className="flex justify-between gap-2">
                  <Button disabled variant="outline">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hide-completed"
                      checked={hideCompletedTasks}
                      onCheckedChange={handleHideCompletedChange}
                    />
                    <label
                      htmlFor="hide-completed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hide completed tasks
                    </label>
                  </div>
                </div>

                <Table className="mt-4">
                  {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                  {/* <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Task</TableHead>
                </TableRow>
              </TableHeader> */}
                  <TableBody>
                    {filteredTasks && filteredTasks.length > 0 ? (
                      <>
                        {filteredTasks.map((task: Task) => (
                          <TableRow key={task.id}>
                            <TableCell className="bg-white">
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
                      <TableCell className="bg-white pt-4">
                        <NewTaskForm projectId={project.id} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <ResourcesSection project={project} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects?.length)
    return <div className="paragraph">No projects yet. Create one above!</div>;

  return <ProjectView project={projects[1]} />;
};
