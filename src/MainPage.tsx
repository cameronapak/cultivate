import { FormEvent, useRef, useState, useEffect } from 'react'
import { Project as BaseProject, Task as BaseTask, Pitch as BasePitch, Resource as BaseResource } from 'wasp/entities'
import { useSearchParams } from 'react-router-dom'
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
  deleteResource
} from 'wasp/client/operations'
import './Main.css'

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
  const { data: projects, isLoading, error } = useQuery(getProjects)
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)

  return (
    <div>
      <h1>Shape Up Projects</h1>
      
      {!showNewProjectForm ? (
        <button 
          onClick={() => setShowNewProjectForm(true)} 
          className="new-project-btn"
        >
          Create New Project
        </button>
      ) : (
        <NewProjectForm onCancel={() => setShowNewProjectForm(false)} />
      )}
      
      {projects && <ProjectsList projects={projects as Project[]} />}
      {isLoading && 'Loading...'}
      {error && 'Error: ' + error}
    </div>
  )
}

const NewProjectForm = ({ onCancel }: { onCancel: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await createProject({
        title: formData.get('title') as string,
        description: formData.get('description') as string
      })
      
      formRef.current?.reset()
      onCancel()
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h2>Create New Project</h2>
      
      <div>
        <label>
          Project Title *
          <input name="title" type="text" required placeholder="Give your project a clear title" />
        </label>
        
        <label>
          Description
          <input name="description" type="text" placeholder="Brief overview of the project" />
        </label>
      </div>
      
      <div>
        <button type="submit">Create Project</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const NewPitchForm = ({ projectId, onCancel }: { projectId: number, onCancel: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await createPitch({
        title: formData.get('title') as string,
        problem: formData.get('problem') as string,
        appetite: formData.get('appetite') as string,
        solution: formData.get('solution') as string,
        rabbitHoles: formData.get('rabbitHoles') as string,
        noGos: formData.get('noGos') as string,
        audience: formData.get('audience') as string,
        insights: formData.get('insights') as string,
        successMetrics: formData.get('successMetrics') as string,
        projectId
      })
      
      formRef.current?.reset()
      onCancel()
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h3>Create New Pitch</h3>
      
      <div>
        <div>
          <h4>About Shape Up Pitches</h4>
          <a 
            href="https://basecamp.com/shapeup/1.5-chapter-06" 
            target="_blank" 
            rel="noopener noreferrer"
            className="shape-up-link"
          >
            Learn more from Shape Up by 37signals →
          </a>
        </div>
        <p>
          A Shape Up pitch is a presentation of a problem and solution that helps teams make informed decisions about what to build.
          Each pitch should include these five key elements:
        </p>
        <ol>
          <li><strong>Problem</strong> — The specific issue or use case that motivates the project</li>
          <li><strong>Appetite</strong> — How much time you're willing to invest (2 weeks, 6 weeks, etc.)</li>
          <li><strong>Solution</strong> — Core elements presented in an easily understandable form</li>
          <li><strong>Rabbit Holes</strong> — Potential challenges or time-consuming details</li>
          <li><strong>No-Gos</strong> — Features or use cases explicitly excluded to fit the appetite</li>
        </ol>
      </div>
      
      <div>
        <label>
          Pitch Title *
          <input name="title" type="text" required placeholder="A clear, descriptive title" />
        </label>
      </div>
      
      <div>
        <h4>1. Problem</h4>
        <p>Describe the specific problem or use case that motivates this project</p>
        <textarea 
          name="problem" 
          required 
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>
      
      <div>
        <h4>2. Appetite</h4>
        <p>How much time are you willing to spend on this? (e.g., "2 weeks", "6 weeks")</p>
        <input 
          name="appetite" 
          type="text" 
          required 
          placeholder="e.g., 2 weeks, 6 weeks" 
        />
      </div>
      
      <div>
        <h4>3. Solution</h4>
        <p>Describe the core elements of your solution</p>
        <textarea 
          name="solution" 
          required 
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>
      
      <div>
        <h4>4. Rabbit Holes</h4>
        <p>Details worth calling out to avoid problems</p>
        <textarea 
          name="rabbitHoles" 
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>
      
      <div>
        <h4>5. No-Gos</h4>
        <p>Anything explicitly excluded from the concept</p>
        <textarea 
          name="noGos" 
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>
      
      <div>
        <h4>Additional Information</h4>
        
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
        <button type="submit">Submit Pitch</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const PitchItem = ({ pitch, onDelete }: { 
  pitch: Pitch, 
  onDelete: () => void 
}) => {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EditPitchForm 
        pitch={pitch} 
        onSave={() => setIsEditing(false)} 
        onCancel={() => setIsEditing(false)} 
      />
    )
  }

  return (
    <div>
      <div>
        <h4>{pitch.title}</h4>
        <div>
          <button onClick={() => setIsEditing(true)}>Edit Pitch</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>    

      <div>
        <div>
          <h5>1. Problem</h5>
          <p>{pitch.problem}</p>
        </div>
        
        <div>
          <h5>2. Appetite</h5>
          <p>{pitch.appetite}</p>
        </div>
        
        <div>
          <h5>3. Solution</h5>
          <p>{pitch.solution}</p>
        </div>
        
        {pitch.rabbitHoles && (
          <div>
            <h5>4. Rabbit Holes</h5>
            <p>{pitch.rabbitHoles}</p>
          </div>
        )}
        
        {pitch.noGos && (
          <div>
            <h5>5. No-Gos</h5>
            <p>{pitch.noGos}</p>
          </div>
        )}
        
        {pitch.audience && (
          <div>
            <h5>Target Audience</h5>
            <p>{pitch.audience}</p>
          </div>
        )}
        
        {pitch.insights && (
          <div>
            <h5>Insights</h5>
            <p>{pitch.insights}</p>
          </div>
        )}
        
        {pitch.successMetrics && (
          <div>
            <h5>Success Metrics</h5>
            <p>{pitch.successMetrics}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const TaskItem = ({ task }: { task: Task }) => {
  const handleStatusChange = async (complete: boolean) => {
    try {
      await updateTaskStatus({ id: task.id, complete })
    } catch (err: any) {
      window.alert('Error updating task: ' + err.message)
    }
  }

  return (
    <div className={`task-item ${task.complete ? 'completed' : ''}`}>
      <div>
        <input
          type="checkbox"
          checked={task.complete}
          onChange={(e) => handleStatusChange(e.target.checked)}
          className="task-checkbox"
        />
        <span>{task.title}</span>
      </div>
      {task.description && <p>{task.description}</p>}
      <div>
        <span>Status: {task.status}</span>
        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

const NewTaskForm = ({ projectId }: { projectId: number }) => {
  const [isAdding, setIsAdding] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      const title = formData.get('title') as string
      const description = formData.get('description') as string || undefined
      
      formRef.current?.reset()
      await createTask({ title, description, projectId })
      setIsAdding(false)
    } catch (err: any) {
      window.alert('Error creating task: ' + err.message)
    }
  }

  if (!isAdding) {
    return (
      <button onClick={() => setIsAdding(true)}>
        + Add Task
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="title" type="text" required placeholder="Task title" />
      <input name="description" type="text" placeholder="Task description (optional)" />
      <div>
        <button type="submit">Add</button>
        <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
      </div>
    </form>
  )
}

const EditProjectForm = ({ project, onSave, onCancel }: { project: Project, onSave: () => void, onCancel: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await updateProject({
        id: project.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string
      })
      
      onSave()
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4>Edit Project</h4>
      
      <div>
        <label>
          Project Title *
          <input 
            name="title" 
            type="text" 
            required 
            defaultValue={project.title}
            placeholder="Give your project a clear title" 
          />
        </label>
        
        <label>
          Description
          <input 
            name="description" 
            type="text"
            defaultValue={project.description || ''}
            placeholder="Brief overview of the project" 
          />
        </label>
      </div>
      
      <div>
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const EditPitchForm = ({ pitch, onSave, onCancel }: { pitch: Pitch, onSave: () => void, onCancel: () => void }) => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await updatePitch({
        id: pitch.id,
        title: formData.get('title') as string,
        problem: formData.get('problem') as string,
        appetite: formData.get('appetite') as string,
        solution: formData.get('solution') as string,
        rabbitHoles: formData.get('rabbitHoles') as string,
        noGos: formData.get('noGos') as string,
        audience: formData.get('audience') as string,
        insights: formData.get('insights') as string,
        successMetrics: formData.get('successMetrics') as string
      })
      
      onSave()
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h3>Edit Pitch</h3>
      
      <div>
        <label>
          Pitch Title *
          <input name="title" type="text" required defaultValue={pitch.title} placeholder="A clear, descriptive title" />
        </label>
      </div>
      
      <div>
        <h4>1. Problem</h4>
        <p>Describe the specific problem or use case that motivates this project</p>
        <textarea 
          name="problem" 
          required 
          defaultValue={pitch.problem}
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>
      
      <div>
        <h4>2. Appetite</h4>
        <p>How much time are you willing to spend on this? (e.g., "2 weeks", "6 weeks")</p>
        <input 
          name="appetite" 
          type="text" 
          required 
          defaultValue={pitch.appetite}
          placeholder="e.g., 2 weeks, 6 weeks" 
        />
      </div>
      
      <div>
        <h4>3. Solution</h4>
        <p>Describe the core elements of your solution</p>
        <textarea 
          name="solution" 
          required 
          defaultValue={pitch.solution}
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>
      
      <div>
        <h4>4. Rabbit Holes</h4>
        <p>Details worth calling out to avoid problems</p>
        <textarea 
          name="rabbitHoles" 
          defaultValue={pitch.rabbitHoles || ''}
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>
      
      <div>
        <h4>5. No-Gos</h4>
        <p>Anything explicitly excluded from the concept</p>
        <textarea 
          name="noGos" 
          defaultValue={pitch.noGos || ''}
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>
      
      <div>
        <h4>Additional Information</h4>
        
        <label>
          Target Audience
          <textarea 
            name="audience" 
            defaultValue={pitch.audience || ''}
            placeholder="Who is this project for? Who will benefit the most?"
            rows={2}
          ></textarea>
        </label>
        
        <label>
          Insights
          <textarea 
            name="insights" 
            defaultValue={pitch.insights || ''}
            placeholder="Any key insights or data points that support this project"
            rows={2}
          ></textarea>
        </label>
        
        <label>
          Success Metrics
          <textarea 
            name="successMetrics" 
            defaultValue={pitch.successMetrics || ''}
            placeholder="How will we measure the success of this project?"
            rows={2}
          ></textarea>
        </label>
      </div>
      
      <div>
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const ResourceItem = ({ resource, onEdit, onDelete }: { 
  resource: Resource, 
  onEdit: () => void, 
  onDelete: () => void 
}) => {
  return (
    <div>
      <div>
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          {resource.title}
        </a>
        <span>{resource.url}</span>
      </div>
      <div>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}

const NewResourceForm = ({ projectId, onSave, onCancel }: { 
  projectId: number, 
  onSave: () => void, 
  onCancel: () => void 
}) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await createResource({
        url: formData.get('url') as string,
        title: formData.get('title') as string,
        projectId
      })
      
      formRef.current?.reset()
      onSave()
    } catch (err: any) {
      window.alert('Error creating resource: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4>Add Resource</h4>
      
      <div>
        <label>
          Title *
          <input name="title" type="text" required placeholder="Resource title or description" />
        </label>
        
        <label>
          URL *
          <input name="url" type="url" required placeholder="https://example.com" />
        </label>
      </div>
      
      <div>
        <button type="submit">Add Resource</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const EditResourceForm = ({ resource, onSave, onCancel }: { 
  resource: Resource, 
  onSave: () => void, 
  onCancel: () => void 
}) => {
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      
      await updateResource({
        id: resource.id,
        url: formData.get('url') as string,
        title: formData.get('title') as string
      })
      
      onSave()
    } catch (err: any) {
      window.alert('Error updating resource: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <h4>Edit Resource</h4>
      
      <div>
        <label>
          Title *
          <input name="title" type="text" required defaultValue={resource.title} placeholder="Resource title or description" />
        </label>
        
        <label>
          URL *
          <input name="url" type="url" required defaultValue={resource.url} placeholder="https://example.com" />
        </label>
      </div>
      
      <div>
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

const ResourcesSection = ({ project }: { project: Project }) => {
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null)
  
  const handleDeleteResource = async (resourceId: number) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource({ id: resourceId })
      } catch (err: any) {
        window.alert('Error deleting resource: ' + err.message)
      }
    }
  }

  return (
    <div>
      <div>
        <h4>Resources</h4>
        {!isAddingResource && (
          <button 
            onClick={() => setIsAddingResource(true)} 
            className="add-resource-btn"
          >
            + Add Resource
          </button>
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
        <div>
          {project.resources.map(resource => 
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
        </div>
      ) : (
        <p>No resources yet. Add links to helpful websites, documents, and other references.</p>
      )}
    </div>
  )
}

const ProjectView = ({ project }: { project: Project }) => {
  const [showNewPitchForm, setShowNewPitchForm] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  
  // Initialize from URL query parameters
  const hideCompletedTasks = searchParams.get('hideCompleted') === 'true'
  const activeTab = searchParams.get('tab')
  const currentTab = activeTab === 'tasks' || activeTab === 'resources' ? activeTab : 'pitches'
  
  const handleHideCompletedChange = (hide: boolean) => {
    const newParams = new URLSearchParams(searchParams)
    if (hide) {
      newParams.set('hideCompleted', 'true')
    } else {
      newParams.delete('hideCompleted')
    }
    setSearchParams(newParams)
  }
  
  const handleTabChange = (tab: 'pitches' | 'tasks' | 'resources') => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', tab)
    setSearchParams(newParams)
  }
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject({ id: project.id })
      } catch (err: any) {
        window.alert('Error deleting project: ' + err.message)
      }
    }
  }

  const handleDeletePitch = async (pitchId: number) => {
    if (confirm('Are you sure you want to delete this pitch?')) {
      try {
        await deletePitch({ id: pitchId })
      } catch (err: any) {
        window.alert('Error deleting pitch: ' + err.message)
      }
    }
  }

  // Filter tasks based on the hideCompletedTasks state
  const filteredTasks = project.tasks?.filter(task => 
    !hideCompletedTasks || !task.complete
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
    )
  }

  return (
    <div>
      <div>
        <h3>{project.title}</h3>
        <div>
          <button onClick={() => setIsEditing(true)}>Edit Project</button>
          <button onClick={handleDelete}>Delete Project</button>
        </div>
      </div>
      
      {project.description && <p>{project.description}</p>}
      
      <div>
        <p>Tasks: {project.tasks?.length || 0}</p>
        <p>Pitch: {project.pitch ? 'Yes' : 'No'}</p>
        <p>Resources: {project.resources?.length || 0}</p>
        <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
      </div>

      <div>
        <button 
          className={`tab-btn ${currentTab === 'pitches' ? 'active' : ''}`} 
          onClick={() => handleTabChange('pitches')}
        >
          Pitch
        </button>
        <button 
          className={`tab-btn ${currentTab === 'tasks' ? 'active' : ''}`} 
          onClick={() => handleTabChange('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab-btn ${currentTab === 'resources' ? 'active' : ''}`} 
          onClick={() => handleTabChange('resources')}
        >
          Resources
        </button>
      </div>
      
      {currentTab === 'pitches' && (
        <div>
          {!project.pitch && !showNewPitchForm ? (
            <button onClick={() => setShowNewPitchForm(true)}>
              + Create Project Pitch
            </button>
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
            <p>No pitch yet. Create one to get started!</p>
          )}
        </div>
      )}
      
      {currentTab === 'tasks' && (
        <div>
          <div>
            <h4>Tasks</h4>
            <div>
              <label>
                <input 
                  type="checkbox" 
                  checked={hideCompletedTasks} 
                  onChange={e => handleHideCompletedChange(e.target.checked)} 
                />
                Hide completed tasks
              </label>
              <NewTaskForm projectId={project.id} />
            </div>
          </div>
          
          {filteredTasks && filteredTasks.length > 0 ? (
            <div>
              {filteredTasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p>
              {project.tasks && project.tasks.length > 0 
                ? 'All tasks are completed and hidden.' 
                : 'No tasks yet'}
            </p>
          )}
        </div>
      )}

      {currentTab === 'resources' && (
        <ResourcesSection project={project} />
      )}
    </div>
  )
}

const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects?.length) return <div>No projects yet. Create one above!</div>

  return (
    <div>
      {projects.map((project) => (
        <ProjectView project={project} key={project.id} />
      ))}
    </div>
  )
}