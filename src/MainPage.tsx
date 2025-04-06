import { FormEvent, useRef, useState, useEffect } from "react";
import {
  Project as BaseProject,
  Task as BaseTask,
  Pitch as BasePitch,
  Resource as BaseResource,
} from "wasp/entities";
import { useSearchParams } from "react-router-dom";
import {
  getProjects,
  useQuery,
  createProject,
  deleteProject,
  createTask,
  updateTaskStatus,
  createPitch,
  updatePitch,
  deletePitch,
  updateProject,
  createResource,
  updateResource,
  deleteResource,
  deleteTask,
} from "wasp/client/operations";
import { Trash, Pencil, ExternalLink } from "lucide-react";
import "./Main.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible";
import { getFaviconFromUrl } from "./lib/utils";

// Extended types with relationships
interface Task extends BaseTask {}

interface Pitch extends BasePitch {}

interface Resource extends BaseResource {}

interface Project extends BaseProject {
  tasks?: Task[];
  pitch?: Pitch;
  resources?: Resource[];
}

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center">
        <h1 className="heading-1">Projects</h1>

        {!showNewProjectForm ? (
          <Button onClick={() => setShowNewProjectForm(true)} variant="default">
            Create New Project
          </Button>
        ) : (
          <NewProjectForm onCancel={() => setShowNewProjectForm(false)} />
        )}
      </div>

      {projects && <ProjectsList projects={projects as Project[]} />}
      {isLoading && "Loading..."}
      {error && "Error: " + error}
    </div>
  );
};

const NewProjectForm = ({ onCancel }: { onCancel: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await createProject({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
      });

      formRef.current?.reset();
      onCancel();
    } catch (err: any) {
      window.alert("Error: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h2 className="heading-2">Create New Project</h2>

      <div>
        <label>
          Project Title *
          <Input
            name="title"
            required
            placeholder="Give your project a clear title"
          />
        </label>

        <label>
          Description
          <Input
            name="description"
            placeholder="Brief overview of the project"
          />
        </label>
      </div>

      <div>
        <Button type="submit" variant="default">
          Create Project
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};

const NewPitchForm = ({
  projectId,
  onCancel,
}: {
  projectId: number;
  onCancel: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await createPitch({
        title: formData.get("title") as string,
        problem: formData.get("problem") as string,
        appetite: formData.get("appetite") as string,
        solution: formData.get("solution") as string,
        rabbitHoles: formData.get("rabbitHoles") as string,
        noGos: formData.get("noGos") as string,
        audience: formData.get("audience") as string,
        insights: formData.get("insights") as string,
        successMetrics: formData.get("successMetrics") as string,
        projectId,
      });

      formRef.current?.reset();
      onCancel();
    } catch (err: any) {
      window.alert("Error: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h3 className="heading-3">Create New Pitch</h3>

      <Collapsible className="mt-4 mb-4">
        <CollapsibleTrigger className="underline">
          <Button size="sm" variant="secondary">
            Learn more about Pitches
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 mb-4">
          <Card>
            <CardHeader>
              <a
                href="https://basecamp.com/shapeup/1.5-chapter-06"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Learn more from Shape Up by 37signals →
              </a>
            </CardHeader>
            <CardContent>
              <p className="paragraph">
                A Shape Up pitch is a presentation of a problem and solution
                that helps teams make informed decisions about what to build.
                Each pitch should include these five key elements:
              </p>
              <ol className="list">
                <li>
                  <strong>Problem</strong> — The specific issue or use case that
                  motivates the project
                </li>
                <li>
                  <strong>Appetite</strong> — How much time you're willing to
                  invest (2 weeks, 6 weeks, etc.)
                </li>
                <li>
                  <strong>Solution</strong> — Core elements presented in an
                  easily understandable form
                </li>
                <li>
                  <strong>Rabbit Holes</strong> — Potential challenges or
                  time-consuming details
                </li>
                <li>
                  <strong>No-Gos</strong> — Features or use cases explicitly
                  excluded to fit the appetite
                </li>
              </ol>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <label>
          Pitch Title *
          <Input
            name="title"
            required
            placeholder="A clear, descriptive title"
          />
        </label>
      </div>

      <div>
        <h4 className="heading-3">1. Problem</h4>
        <p className="paragraph">
          Describe the specific problem or use case that motivates this project
        </p>
        <textarea
          name="problem"
          required
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">2. Appetite</h4>
        <p className="paragraph">
          How much time are you willing to spend on this? (e.g., "2 weeks", "6
          weeks")
        </p>
        <Input name="appetite" required placeholder="e.g., 2 weeks, 6 weeks" />
      </div>

      <div>
        <h4 className="heading-3">3. Solution</h4>
        <p className="paragraph">Describe the core elements of your solution</p>
        <textarea
          name="solution"
          required
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">4. Rabbit Holes</h4>
        <p className="paragraph">Details worth calling out to avoid problems</p>
        <textarea
          name="rabbitHoles"
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">5. No-Gos</h4>
        <p className="paragraph">
          Anything explicitly excluded from the concept
        </p>
        <textarea
          name="noGos"
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">Additional Information</h4>

        <label>
          Target Audience
          <textarea
            name="audience"
            placeholder="Who is this project for? Who will benefit the most?"
            rows={2}
          ></textarea>
        </label>

        <label>
          Insights
          <textarea
            name="insights"
            placeholder="Any key insights or data points that support this project"
            rows={2}
          ></textarea>
        </label>

        <label>
          Success Metrics
          <textarea
            name="successMetrics"
            placeholder="How will we measure the success of this project?"
            rows={2}
          ></textarea>
        </label>
      </div>

      <div>
        <Button type="submit" variant="default">
          Submit Pitch
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};

const PitchItem = ({
  pitch,
  onDelete,
}: {
  pitch: Pitch;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditPitchForm
        pitch={pitch}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div>
      <div>
        <h4 className="heading-3">{pitch.title}</h4>
        <div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Pitch
          </Button>
          <Button onClick={onDelete} variant="destructive">
            Delete
          </Button>
        </div>
      </div>

      <div>
        <div>
          <h5 className="heading-3">1. Problem</h5>
          <p className="paragraph">{pitch.problem}</p>
        </div>

        <div>
          <h5 className="heading-3">2. Appetite</h5>
          <p className="paragraph">{pitch.appetite}</p>
        </div>

        <div>
          <h5 className="heading-3">3. Solution</h5>
          <p className="paragraph">{pitch.solution}</p>
        </div>

        {pitch.rabbitHoles && (
          <div>
            <h5 className="heading-3">4. Rabbit Holes</h5>
            <p className="paragraph">{pitch.rabbitHoles}</p>
          </div>
        )}

        {pitch.noGos && (
          <div>
            <h5 className="heading-3">5. No-Gos</h5>
            <p className="paragraph">{pitch.noGos}</p>
          </div>
        )}

        {pitch.audience && (
          <div>
            <h5 className="heading-3">Target Audience</h5>
            <p className="paragraph">{pitch.audience}</p>
          </div>
        )}

        {pitch.insights && (
          <div>
            <h5 className="heading-3">Insights</h5>
            <p className="paragraph">{pitch.insights}</p>
          </div>
        )}

        {pitch.successMetrics && (
          <div>
            <h5 className="heading-3">Success Metrics</h5>
            <p className="paragraph">{pitch.successMetrics}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskItem = ({ task }: { task: Task }) => {
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

  return (
    <div className={`task-item ${task.complete ? "completed" : ""}`}>
      <div className="flex items-center space-x-2 justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={task.id.toString()}
            checked={task.complete}
            onCheckedChange={(checked) => handleStatusChange(checked === true)}
          />
          <label
            htmlFor={task.id.toString()}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {task.title}
          </label>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const NewTaskForm = ({ projectId }: { projectId: number }) => {
  const [isAdding, setIsAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const title = formData.get("title") as string;
      const description = (formData.get("description") as string) || undefined;

      formRef.current?.reset();
      await createTask({ title, description, projectId });
      setIsAdding(false);
    } catch (err: any) {
      window.alert("Error creating task: " + err.message);
    }
  };

  if (!isAdding) {
    return (
      <Button onClick={() => setIsAdding(true)} variant="outline">
        + Add Task
      </Button>
    );
  }

  return (
    <form className="flex flex-col gap-2" ref={formRef} onSubmit={handleSubmit}>
      <Input name="title" required placeholder="Task title" autoFocus />
      <Input name="description" placeholder="Task description (optional)" />
      <div className="flex gap-2 mt-4 items-center">
        <Button type="submit" variant="default">
          Add
        </Button>
        <Button
          type="button"
          onClick={() => setIsAdding(false)}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
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

const EditPitchForm = ({
  pitch,
  onSave,
  onCancel,
}: {
  pitch: Pitch;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await updatePitch({
        id: pitch.id,
        title: formData.get("title") as string,
        problem: formData.get("problem") as string,
        appetite: formData.get("appetite") as string,
        solution: formData.get("solution") as string,
        rabbitHoles: formData.get("rabbitHoles") as string,
        noGos: formData.get("noGos") as string,
        audience: formData.get("audience") as string,
        insights: formData.get("insights") as string,
        successMetrics: formData.get("successMetrics") as string,
      });

      onSave();
    } catch (err: any) {
      window.alert("Error: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h3 className="heading-3">Edit Pitch</h3>

      <div>
        <label>
          Pitch Title *
          <Input
            name="title"
            required
            defaultValue={pitch.title}
            placeholder="A clear, descriptive title"
          />
        </label>
      </div>

      <div>
        <h4 className="heading-3">1. Problem</h4>
        <p className="paragraph">
          Describe the specific problem or use case that motivates this project
        </p>
        <textarea
          name="problem"
          required
          defaultValue={pitch.problem}
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">2. Appetite</h4>
        <p className="paragraph">
          How much time are you willing to spend on this? (e.g., "2 weeks", "6
          weeks")
        </p>
        <Input
          name="appetite"
          required
          defaultValue={pitch.appetite}
          placeholder="e.g., 2 weeks, 6 weeks"
        />
      </div>

      <div>
        <h4 className="heading-3">3. Solution</h4>
        <p className="paragraph">Describe the core elements of your solution</p>
        <textarea
          name="solution"
          required
          defaultValue={pitch.solution}
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">4. Rabbit Holes</h4>
        <p className="paragraph">Details worth calling out to avoid problems</p>
        <textarea
          name="rabbitHoles"
          defaultValue={pitch.rabbitHoles || ""}
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">5. No-Gos</h4>
        <p className="paragraph">
          Anything explicitly excluded from the concept
        </p>
        <textarea
          name="noGos"
          defaultValue={pitch.noGos || ""}
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>

      <div>
        <h4 className="heading-3">Additional Information</h4>

        <label>
          Target Audience
          <textarea
            name="audience"
            defaultValue={pitch.audience || ""}
            placeholder="Who is this project for? Who will benefit the most?"
            rows={2}
          ></textarea>
        </label>

        <label>
          Insights
          <textarea
            name="insights"
            defaultValue={pitch.insights || ""}
            placeholder="Any key insights or data points that support this project"
            rows={2}
          ></textarea>
        </label>

        <label>
          Success Metrics
          <textarea
            name="successMetrics"
            defaultValue={pitch.successMetrics || ""}
            placeholder="How will we measure the success of this project?"
            rows={2}
          ></textarea>
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
  let faviconUrl = null;
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
              <p className="text-sm link">{resource.title}</p>
              <p className="text-sm text-gray-500">{url}</p>
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
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await createResource({
        url: formData.get("url") as string,
        title: formData.get("title") as string,
        projectId,
      });

      formRef.current?.reset();
      onSave();
    } catch (err: any) {
      window.alert("Error creating resource: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4 className="heading-3">Add Resource</h4>

      <div>
        <label>
          Title *
          <Input
            name="title"
            required
            placeholder="Resource title or description"
          />
        </label>

        <label>
          URL *
          <Input
            name="url"
            type="url"
            required
            placeholder="https://example.com"
          />
        </label>
      </div>

      <div>
        <Button type="submit" variant="default">
          Add Resource
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
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
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      await updateResource({
        id: resource.id,
        url: formData.get("url") as string,
        title: formData.get("title") as string,
      });

      onSave();
    } catch (err: any) {
      window.alert("Error updating resource: " + err.message);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4 className="heading-3">Edit Resource</h4>

      <div>
        <label>
          Title *
          <Input
            name="title"
            required
            defaultValue={resource.title}
            placeholder="Resource title or description"
          />
        </label>

        <label>
          URL *
          <Input
            name="url"
            type="url"
            required
            defaultValue={resource.url}
            placeholder="https://example.com"
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
    <div>
      <div>
        {!isAddingResource && (
          <Button onClick={() => setIsAddingResource(true)} variant="outline">
            + Add Resource
          </Button>
        )}
      </div>

      {isAddingResource && (
        <NewResourceForm
          projectId={project.id}
          onSave={() => setIsAddingResource(false)}
          onCancel={() => setIsAddingResource(false)}
        />
      )}

      {project.resources && project.resources.length > 0 ? (
        <Table>
          {project.resources.map((resource) =>
            editingResourceId === resource.id ? (
              <EditResourceForm
                key={resource.id}
                resource={resource}
                onSave={() => setEditingResourceId(null)}
                onCancel={() => setEditingResourceId(null)}
              />
            ) : (
              <ResourceItem
                key={resource.id}
                resource={resource}
                onEdit={() => setEditingResourceId(resource.id)}
                onDelete={() => handleDeleteResource(resource.id)}
              />
            )
          )}
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

const ProjectView = ({ project }: { project: Project }) => {
  const [showNewPitchForm, setShowNewPitchForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize from URL query parameters
  const hideCompletedTasks = searchParams.get("hideCompleted") === "true";
  const activeTab = searchParams.get("tab");
  const currentTab =
    activeTab === "tasks" || activeTab === "resources" ? activeTab : "pitches";

  const handleHideCompletedChange = (hide: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (hide) {
      newParams.set("hideCompleted", "true");
    } else {
      newParams.delete("hideCompleted");
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (tab: "pitches" | "tasks" | "resources") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
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

  const handleDeletePitch = async (pitchId: number) => {
    if (confirm("Are you sure you want to delete this pitch?")) {
      try {
        await deletePitch({ id: pitchId });
      } catch (err: any) {
        window.alert("Error deleting pitch: " + err.message);
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
        <CardHeader className="pb-4">
          <CardTitle>
            <h2 className="heading-3 mt-0">{project.title}</h2>
          </CardTitle>
          {project.description && (
            <CardDescription>{project.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={currentTab}
            className="w-[400px]"
            onValueChange={(value) =>
              handleTabChange(value as "pitches" | "tasks" | "resources")
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pitches">Pitch</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="pitches">
              <div>
                {!project.pitch && !showNewPitchForm ? (
                  <Button
                    onClick={() => setShowNewPitchForm(true)}
                    variant="outline"
                  >
                    + Create Project Pitch
                  </Button>
                ) : showNewPitchForm ? (
                  <NewPitchForm
                    projectId={project.id}
                    onCancel={() => setShowNewPitchForm(false)}
                  />
                ) : project.pitch ? (
                  <div>
                    <PitchItem
                      pitch={project.pitch}
                      onDelete={() => handleDeletePitch(project.pitch!.id)}
                    />
                  </div>
                ) : (
                  <p className="paragraph">
                    No pitch yet. Create one to get started!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="mt-4">
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
                            <TableCell>
                              <TaskItem key={task.id} task={task} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell>
                          <p className="paragraph">
                            {project.tasks && project.tasks.length > 0
                              ? "All tasks are completed and hidden."
                              : "No tasks yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
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

  return (
    <div>
      {projects.map((project) => (
        <ProjectView project={project} key={project.id} />
      ))}
    </div>
  );
};
