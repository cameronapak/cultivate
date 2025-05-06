import { useState, useRef, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Task, Resource, Pitch, Thought } from "wasp/entities";
import {
  deleteTask,
  updateTask,
  createTask,
  createResource,
  updateResource,
  deleteResource,
  updateProject,
  deleteProject,
  updateProjectTaskOrder,
  updateProjectResourceOrder,
  createThought,
  deleteThought,
  updateThought,
  updateTaskStatus,
  useAction,
  getThoughts,
} from "wasp/client/operations";
import {
  ExternalLink,
  Link2,
  Plus,
  Trash2,
  Settings2Icon,
  Square,
  Info,
  Minus,
  SendIcon,
} from "lucide-react";
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
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Table, TableBody } from "../components/ui/table";
import { isUrl, getMetadataFromUrl, cn } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
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
import { Switch } from "./ui/switch";
import React from "react";
import { useTabShortcuts } from "../hooks/useKeyboardShortcuts";
import { useLayoutState, type TabType } from "../hooks/useLayoutState";
import { Project } from "../types";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { ItemRow, DisplayItem } from "../components/common/ItemRow";

export const EditTaskForm = ({
  task,
  onSave,
  onCancel,
}: {
  task: Task;
  onSave: (values: { title: string; description?: string }) => void;
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

  const processSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(processSubmit)}
        className="flex flex-col gap-2 p-2"
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
                  className="text-muted-foreground placeholder:text-muted-foreground"
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

const TaskList = ({
  tasks,
  projectId,
}: {
  tasks: Task[];
  projectId: number;
}) => {
  const [parentRef, values, setValues] = useDragAndDrop<HTMLTableSectionElement, Task>(
    tasks,
    {
      onSort: async (event) => {
        const newTaskOrder = (event.values as Task[]).map((task) => task.id);
        try {
          await updateProjectTaskOrder({
            projectId: projectId,
            taskOrder: newTaskOrder,
          });
        } catch (error) {
          console.error("Failed to update task order:", error);
          setValues(tasks);
        }
      },
      draggingClass: "bg-muted",
      dropZoneClass: "bg-muted opacity-30",
      dragHandle: ".drag-handle",
    }
  );
  const [editingItemId, setEditingItemId] = useState<{ id: string | number | null, type: string } | null>(null);
  const [searchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");

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

  // Update values when tasks prop changes
  React.useEffect(() => {
    setValues(tasks);
  }, [tasks, setValues]);

  const handleEdit = (item: DisplayItem) => {
    setEditingItemId({ id: item.id, type: item.type });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const updateThoughtOptimistically = useAction(updateThought, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [getThoughts],
        updateQuery: (payload, oldData) => {
          return (oldData || []).map((thought: Thought & { type: "thought" }) =>
            thought.id === payload.id
              ? { ...thought, ...payload, updatedAt: new Date() }
              : thought
          );
        },
      },
    ],
  });

  const handleSave = async (item: DisplayItem, formValues: any) => {
    if (item.type === 'task') {
      await updateTask({
        id: item.id as number,
        title: formValues.title,
        description: formValues.description,
      });
      toast.success("Task updated successfully");
    } else if (item.type === 'resource') {
      // This case should ideally not happen in TaskList
      await updateResource({
        id: item.id as number,
        title: formValues.title,
        url: formValues.url, // Assuming form provides URL
        description: formValues.description,
      });
      toast.success("Resource updated successfully");
    } else if (item.type === 'thought') {
      // This case should ideally not happen in TaskList
      await updateThoughtOptimistically({ 
        id: item.id as string, 
        content: formValues.content 
      }); 
      toast.success("Thought updated successfully");
    }
    setEditingItemId(null);
  };

  const handleDelete = async (item: DisplayItem) => {
    if (item.type === 'task') {
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteTask({ id: item.id as number });
        toast.success("Task deleted successfully");
      }
    } else if (item.type === 'resource') {
      // This case should ideally not happen in TaskList
       if (confirm("Are you sure you want to delete this resource?")) {
         await deleteResource({ id: item.id as number });
         toast.success("Resource deleted successfully");
       }
    } else if (item.type === 'thought') {
       // This case should ideally not happen in TaskList
       if (confirm("Are you sure you want to delete this thought?")) {
         await deleteThought({ id: item.id as string });
         toast.success("Thought deleted successfully");
       }
    }
  };
  
  const renderTaskEditForm = (
    item: DisplayItem,
    onSaveCallback: (values: any) => void,
    onCancelCallback: () => void
  ) => {
    if (item.type === 'task') {
      return (
        <EditTaskForm
          task={item as Task}
          onSave={onSaveCallback}
          onCancel={onCancelCallback}
        />
      );
    }
    return null;
  };

  return (
    <Table>
      <TableBody ref={parentRef}>
        {values.map((task) => (
          <ItemRow
            isActive={`${activeResourceId}` === `${task.id}`}
            key={task.id}
            item={{ ...task, type: 'task' }}
            isEditing={editingItemId?.id === task.id && editingItemId?.type === 'task'}
            onEdit={handleEdit}
            onCheckedChange={handleStatusChange}
            onCancelEdit={handleCancelEdit}
            renderEditForm={(item, onSave, onCancel) => renderTaskEditForm(item, (values) => handleSave(item, values), onCancel)}
          />
        ))}
      </TableBody>
    </Table>
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
      // Create task in database
      await createTask({
        title: values.title,
        description: values.description,
        projectId,
      });
      toast.success("Task created successfully");
      form.reset();
      setIsAdding(false);
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
                  className="text-muted-foreground"
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

const NewResourceForm = ({ projectId }: { projectId: number }) => {
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
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

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("url", value);

    // If the input is a URL, try to fetch metadata
    if (isUrl(value.trim())) {
      setIsFetchingMetadata(true);
      try {
        const metadata = await getMetadataFromUrl(value.trim());
        form.setValue("title", metadata.title || value);
        if (metadata.description) {
          form.setValue("description", metadata.description);
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      } finally {
        setIsFetchingMetadata(false);
      }
    }
  };

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
    } catch (err: any) {
      toast.error("Error creating resource: " + err.message);
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
                <div className="relative">
                  <Input
                    autoFocus
                    placeholder="https://example.com"
                    {...field}
                    onChange={handleUrlChange}
                    className={isFetchingMetadata ? "pr-8" : ""}
                  />
                  {isFetchingMetadata && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
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
                <Input placeholder="Resource title or name" {...field} />
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

        <div className="grid grid-cols-2 gap-2 mt-4">
          <PopoverClose asChild>
            <Button type="submit" variant="default">
              Add Resource
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </PopoverClose>
        </div>
      </form>
    </Form>
  );
};

export const EditResourceForm = ({
  resource,
  onSave,
  onCancel,
}: {
  resource: Resource;
  onSave: (values: { title: string; url: string; description?: string }) => void;
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

  const processSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-4 p-2">
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

export const EditThoughtForm = ({
  thought,
  onSave,
  onCancel,
}: {
  thought: Thought;
  onSave: (values: { content: string }) => void;
  onCancel: () => void;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Note content cannot be empty" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: thought.content || "",
    },
  });

  const processSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-2 p-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Edit your note..."
                  className="min-h-[60px]" // Smaller height for inline editing
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <Button size="sm" type="submit" variant="default">
            Save Note
          </Button>
          <Button size="sm" type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ResourcesSection = ({ project }: { project: Project }) => {
  // Sort resources by the order in the project.resourceOrder array
  const sortedResources = project.resources?.sort((a, b) => {
    const indexA = project.resourceOrder?.indexOf(a.id) || 0;
    const indexB = project.resourceOrder?.indexOf(b.id) || 0;
    return indexA - indexB;
  });
  const [searchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");

  const [parentRef, values, setValues] = useDragAndDrop<HTMLTableSectionElement, Resource>(
    sortedResources || [],
    {
      onSort: async (event) => {
        const newResourceOrder = (event.values as Resource[]).map((resource) => resource.id);
        try {
          await updateProjectResourceOrder({
            projectId: project.id,
            resourceOrder: newResourceOrder,
          });
        } catch (error) {
          console.error("Failed to update resource order:", error);
          setValues(sortedResources || []);
        }
      },
      draggingClass: "bg-muted",
      dropZoneClass: "bg-muted opacity-30",
      dragHandle: ".drag-handle",
    }
  );
  const [editingItemId, setEditingItemId] = useState<{ id: string | number | null, type: string } | null>(null);

  // Update values when resources prop changes
  React.useEffect(() => {
    setValues(sortedResources || []);
  }, [project.resources, project.resourceOrder, setValues]);

  const handleEdit = (item: DisplayItem) => {
    setEditingItemId({ id: item.id, type: item.type });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSave = async (item: DisplayItem, formValues: any) => {
    if (item.type === 'resource') {
       await updateResource({
         id: item.id as number,
         title: formValues.title,
         url: formValues.url,
         description: formValues.description,
       });
       toast.success("Resource updated successfully");
    } else if (item.type === 'task') {
      // This case should ideally not happen in ResourcesSection
      await updateTask({
        id: item.id as number,
        title: formValues.title,
        description: formValues.description,
      });
      toast.success("Task updated successfully");
    } else if (item.type === 'thought') {
      // This case should ideally not happen in ResourcesSection
       await updateThought({ 
        id: item.id as string, 
        content: formValues.content 
      }); 
       toast.success("Thought updated successfully");
    }
    setEditingItemId(null);
  };

  const handleDelete = async (item: DisplayItem) => {
    if (item.type === 'resource') {
       if (confirm("Are you sure you want to delete this resource?")) {
         await deleteResource({ id: item.id as number });
         toast.success("Resource deleted successfully");
       }
    } else if (item.type === 'task') {
      // This case should ideally not happen in ResourcesSection
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteTask({ id: item.id as number });
        toast.success("Task deleted successfully");
      }
    } else if (item.type === 'thought') {
      // This case should ideally not happen in ResourcesSection
       if (confirm("Are you sure you want to delete this thought?")) {
         await deleteThought({ id: item.id as string });
         toast.success("Thought deleted successfully");
       }
    }
  };
  
  const renderResourceEditForm = (
    item: DisplayItem,
    onSaveCallback: (values: any) => void,
    onCancelCallback: () => void
  ) => {
    if (item.type === 'resource') {
      return (
        <EditResourceForm
          resource={item as Resource}
          onSave={onSaveCallback}
          onCancel={onCancelCallback}
        />
      );
    }
    return null;
  };

  return (
    <div>
      {values && values.length > 0 ? (
        <Table>
          <TableBody ref={parentRef}>
            {values.map((resource: Resource) => (
                <ItemRow
                  isActive={`${activeResourceId}` === `${resource.id}`}
                  key={resource.id}
                  item={{ ...resource, type: 'resource' }}
                  isEditing={editingItemId?.id === resource.id && editingItemId?.type === 'resource'}
                  onEdit={handleEdit}
                  onCancelEdit={handleCancelEdit}
                  renderEditForm={(item, onSave, onCancel) => renderResourceEditForm(item, (values) => handleSave(item, values), onCancel)}
                />
            ))}
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

const NotesForm = ({
  projectId,
  handleCreateThought,
}: {
  projectId: number;
  handleCreateThought: any;
}) => {
  const formSchema = z.object({
    content: z.string().min(1, { message: "Note content is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await handleCreateThought({
        content: values.content,
        projectId: projectId,
      });
      toast.success("Note created successfully");
      form.reset();
    } catch (err: any) {
      toast.error("Error creating note: " + err.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Write your note here..."
                  className="pr-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
          size="icon"
          type="submit"
          className="absolute right-0 top-0 rounded-l-none"
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
};

type ProjectWithRelations = Project & {
  tasks?: Task[];
  resources?: Resource[];
  pitch?: Pitch;
};

export const ProjectView = ({ project }: { project: Project }) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { currentTab, setTab, hideCompletedTasks, toggleHideCompleted } =
    useLayoutState();
  const [editingItemId, setEditingItemId] = useState<{ id: string | number | null, type: string } | null>(null);
  const [searchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");

  const handleTabChange = (tab: TabType) => {
    setTab(tab);
  };

  // Handlers for editing notes (Thoughts)
  const handleEditNote = (item: DisplayItem) => {
    if (item.type === 'thought') {
      setEditingItemId({ id: item.id, type: 'thought' });
    }
  };

  const handleCancelEditNote = () => {
    setEditingItemId(null);
  };

  const handleSaveNote = async (item: DisplayItem, values: any) => {
    if (item.type === 'thought') {
      try {
        await updateThought({ id: item.id as string, content: values.content });
        toast.success("Note updated successfully");
        setEditingItemId(null); // Exit edit mode on success
      } catch (err: any) {
        toast.error("Error updating note: " + err.message);
      }
    }
  };

  const handleCreateThought = useAction(createThought, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [getThoughts],
        updateQuery: (payload, oldData) => {
          const newThought = {
            id: Date.now().toString(), // Temporary ID
            content: payload.content,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: payload.projectId,
            type: "thought" as const,
            title: payload.content.slice(0, 50) + "...", // Generate a title from content
          };
          return [...(oldData || []), newThought];
        },
      },
    ],
  });

  const deleteThoughtOptimistically = useAction(deleteThought, {
    optimisticUpdates: [
      {
        getQuerySpecifier: () => [getThoughts],
        updateQuery: (payload, oldData) => {
          return (oldData || []).filter((thought: Thought & { type: "thought" }) => thought.id !== payload.id);
        },
      },
    ],
  });

  // Use the new hook for tab shortcuts
  useTabShortcuts(handleTabChange);

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
    (task) => !hideCompletedTasks || !task.complete
  );

  // Sort tasks by the order in the project.taskOrder array
  const sortedTasks = filteredTasks?.sort((a, b) => {
    const indexA = project.taskOrder.indexOf(a.id) || 0;
    const indexB = project.taskOrder.indexOf(b.id) || 0;
    return indexA - indexB;
  });

  // Sort thoughts by createdAt date (newest first)
  const sortedThoughts = project.thoughts?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
      {/* @TODO - add emoji to project for customization and easier identification — db already supports it */}
      <h1 className="heading-1">{project.title}</h1>
      <p className="paragraph text-muted-foreground !mt-0 line-clamp-2">
        {project.description}
      </p>
      <div
        className="flex items-center my-6 w-fit"
        role="tablist"
        aria-label="Filter inbox items"
      >
        {/* <Button
          variant={currentTab === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleTabChange("all")}
          className={cn(
            "relative px-3 rounded-full text-muted-foreground shadow-none",
            currentTab === "all" && "text-primary"
          )}
          role="tab"
          aria-selected={currentTab === "all"}
          aria-controls="all-items-tab"
          id="all-tab"
        >
          <List className="h-4 w-4" aria-hidden="true" />
          <span>All</span>
          {/ * <span className="sr-only">{getItemCount("all")} items</span> * /}
        </Button> */}
        <Button
          variant={currentTab === "task" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabChange("task")}
          className={cn(
            "relative px-3 rounded-full text-muted-foreground shadow-none",
            currentTab === "task" && "text-primary-foreground"
          )}
          role="tab"
          aria-selected={currentTab === "task"}
          aria-controls="tasks-tab"
          id="tasks-tab"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          <span>Tasks</span>
          {/* <span className="sr-only">{getItemCount("task")} tasks</span> */}
        </Button>
        <Button
          variant={currentTab === "resource" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabChange("resource")}
          className={cn(
            "relative px-3 rounded-full text-muted-foreground shadow-none",
            currentTab === "resource" && "text-primary-foreground"
          )}
          role="tab"
          aria-selected={currentTab === "resource"}
          aria-controls="resources-tab"
          id="resources-tab"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
          <span>Links</span>
        </Button>
        <Button
          variant={currentTab === "notes" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabChange("notes")}
          className={cn(
            "relative px-3 rounded-full text-muted-foreground shadow-none",
            currentTab === "notes" && "text-primary-foreground"
          )}
          role="tab"
          aria-selected={currentTab === "notes"}
          aria-controls="notes-tab"
          id="notes-tab"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
          <span>Notes</span>
        </Button>
        <Button
          variant={currentTab === "about" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabChange("about")}
          className={cn(
            "relative px-3 rounded-full text-muted-foreground shadow-none",
            currentTab === "about" && "text-primary-foreground"
          )}
          role="tab"
          aria-selected={currentTab === "about"}
          aria-controls="about-tab"
          id="about-tab"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          <span>About</span>
          {/* <span className="sr-only">{getItemCount("task")} tasks</span> */}
        </Button>
      </div>
      <Tabs
        value={currentTab}
        onValueChange={(value) =>
          handleTabChange(value as "about" | "task" | "resource" | "notes")
        }
      >
        <TabsContent value="task">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Tasks</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <CircleCheckIcon className="w-4 h-4" />
                      {
                        project.tasks?.filter((task) => !task.complete).length
                      }{" "}
                      tasks remaining
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
                        <label
                          htmlFor="hide-completed"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Hide Completed Tasks
                        </label>
                        <Switch
                          id="hide-completed"
                          checked={hideCompletedTasks}
                          onCheckedChange={toggleHideCompleted}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {sortedTasks && sortedTasks.length > 0 ? (
                  <TaskList tasks={sortedTasks} projectId={project.id} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {project?.tasks?.length
                      ? "All tasks are completed and/or hidden."
                      : "No tasks yet"}
                  </p>
                )}
                <div className="mt-4">
                  <NewTaskForm projectId={project.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resource">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Links</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      {project.resources?.length || 0} resource(s)
                    </CardDescription>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <NewResourceForm projectId={project.id} />
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

        <TabsContent value="notes">
          <div className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                {!sortedThoughts?.length && (
                  <CardDescription>Add notes to your project</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <NotesForm
                  projectId={project.id}
                  handleCreateThought={handleCreateThought}
                />
                <Table className="mt-4">
                  <TableBody>
                    {sortedThoughts?.map((thought: Thought) => (
                      <ItemRow
                        isActive={`${activeResourceId}` === `${thought.id}`}
                        key={thought.id}
                        item={{
                          ...thought,
                          type: "thought",
                          title:
                            thought.content.slice(0, 60) +
                            (thought.content.length > 60 ? "..." : ""),
                        }}
                        isEditing={
                          editingItemId?.id === thought.id &&
                          editingItemId?.type === "thought"
                        }
                        onEdit={handleEditNote}
                        onCancelEdit={handleCancelEditNote}
                        renderEditForm={(item, onSave, onCancel) =>
                          item.type === "thought" ? (
                            <EditThoughtForm
                              thought={item as Thought}
                              onSave={(values) => handleSaveNote(item, values)}
                              onCancel={onCancel}
                            />
                          ) : null
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
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
