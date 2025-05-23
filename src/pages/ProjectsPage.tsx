import { FormEvent, useRef, useState } from "react";
import {
  Project as BaseProject,
  Task as BaseTask,
  Resource as BaseResource,
} from "wasp/entities";
import { useNavigate } from "react-router-dom";
import { Link } from "wasp/client/router";
import {
  getProjects,
  useQuery,
  createProject,
  createTask,
  updateTaskStatus,
  updateTask,
  pinProject,
  updateProject,
  createResource,
  updateResource,
  deleteResource,
  deleteTask,
} from "wasp/client/operations";
import {
  Trash,
  Pencil,
  ExternalLink,
  Plus,
  Folder,
  Pin,
  PinOff,
} from "lucide-react";
import "../Main.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
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
} from "../components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Switch } from "../components/ui/switch";
import {
  Table,
  TableCaption,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { getFaviconFromUrl } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Layout } from "../components/Layout";
import { toast } from "sonner";
import {
  EmptyStateRoot,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "../components/custom/EmptyStateView";

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

export const ProjectsPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects);
  const navigate = useNavigate();

  const pinnedProjects =
    projects?.filter((project: Project) => project.pinned) || [];

  const handlePinToggle = async (project: Project) => {
    try {
      await pinProject({
        id: project.id,
        pinned: !project.pinned,
      });
      toast.success(`Project "${project.title}" ${project.pinned ? "unpinned" : "pinned"}`);
    } catch (error: any) {
      console.error("Failed to update project pin status:", error);
      toast.error(error?.message || "Failed to update project pin status");
    }
  };

  return (
    <Layout
      isLoading={isLoading}
      breadcrumbItems={[{ title: "Collections" }]}
      ctaButton={
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="w-4 h-4" />
              <span className="sr-only">New Collection</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <NewProjectForm onCancel={() => {}} />
          </PopoverContent>
        </Popover>
      }
    >
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {projects && projects.length > 0 ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedProjects.length > 0
              ? pinnedProjects.map((project: Project) => (
                  <ProjectCard
                    onTogglePin={() => handlePinToggle(project)}
                    key={project.id}
                    project={project}
                  />
                ))
              : null}
          </section>

          <section className="mt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project: Project) => (
                  <TableRow className="group w-full" key={project.id}>
                    <TableCell
                      className="w-full flex flex-col items-start cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                      role="link"
                    >
                      <p>{project.title}</p>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Button
                        onClick={() => handlePinToggle(project)}
                        variant="outline"
                        size="icon"
                        className="group-hover:opacity-100 opacity-0 transition-opacity duration-150"
                      >
                        {project.pinned ? (
                          <PinOff className="w-4 h-4" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </>
      ) : (
        !isLoading && (
          <EmptyStateRoot className="mx-auto">
            <EmptyStateIcon>
              <Folder />
            </EmptyStateIcon>
            <EmptyStateTitle>Create your first project</EmptyStateTitle>
            <EmptyStateDescription>
              Create projects to organize your tasks and resources.
            </EmptyStateDescription>
            <EmptyStateAction>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Get Started</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <NewProjectForm onCancel={() => {}} />
                </PopoverContent>
              </Popover>
            </EmptyStateAction>
          </EmptyStateRoot>
        )
      )}
    </Layout>
  );
};

const NewProjectForm = ({ onCancel }: { onCancel: () => void }) => {
  const navigate = useNavigate();
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    try {
      const project = await createProject({
        title: values.title,
        description: values.description || "",
      });
      toast.success(`Created collection "${values.title}"`);
      navigate(`/projects/${project.id}`);
      form.reset();
    } catch (err: any) {
      window.alert("Error: " + err.message);
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
              <FormLabel>Collection Title</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="Give your collection a clear title"
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
                <Textarea
                  placeholder="Brief overview of the project. Can be edited later."
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <PopoverClose asChild>
            <Button
              type="button"
              onClick={() => form.reset()}
              variant="outline"
            >
              Cancel
            </Button>
          </PopoverClose>
          <Button type="submit">
            Create
          </Button>
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
              <p className="text-sm text-muted-foreground line-clamp-1">
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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>
            <ExternalLink className="mt-0.5 w-4 h-4 text-muted-foreground" />
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
                  <TableCell colSpan={2} className="bg-background">
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
        <p className="paragraph text-sm text-muted-foreground">
          No resources yet. Add links to helpful websites, documents, and other
          references.
        </p>
      )}
    </div>
  );
};

const ProjectCard = ({
  project,
  onTogglePin,
}: {
  project: Project;
  onTogglePin: () => void;
}) => {
  const handleTogglePin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePin();
  };

  return (
    <Link
      key={project.id}
      to={"/projects/:projectId"}
      params={{ projectId: project.id }}
      className="no-underline"
    >
      <Card className="group h-full relative hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{project.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="group-hover:opacity-100 opacity-0 transition-opacity duration-150 h-8 w-8 text-muted-foreground absolute top-2 right-2"
              onClick={handleTogglePin}
            >
              {project.pinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
          </div>
          {project.description && (
            <CardDescription>{project.description}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
};
