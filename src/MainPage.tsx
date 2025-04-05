import { FormEvent, useRef, useState } from 'react'
import { Project as BaseProject, Task as BaseTask, Pitch as BasePitch } from 'wasp/entities'
import { 
  getProjects, 
  useQuery, 
  createProject, 
  deleteProject, 
  createTask, 
  updateTaskStatus,
  createPitch,
  selectPitch,
  deletePitch
} from 'wasp/client/operations'
import './Main.css'

// Extended types with relationships
interface Task extends BaseTask {}

interface Pitch extends BasePitch {}

interface Project extends BaseProject {
  tasks?: Task[];
  pitches?: Pitch[];
}

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects)
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)

  return (
    <div className="main-container">
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
    <form ref={formRef} onSubmit={handleSubmit} className="new-project-form">
      <h2>Create New Project</h2>
      
      <div className="form-section">
        <label>
          Project Title *
          <input name="title" type="text" required placeholder="Give your project a clear title" />
        </label>
        
        <label>
          Description
          <input name="description" type="text" placeholder="Brief overview of the project" />
        </label>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="submit-btn">Create Project</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
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
    <form ref={formRef} onSubmit={handleSubmit} className="new-pitch-form">
      <h3>Create New Pitch</h3>
      
      <div className="form-section">
        <label>
          Pitch Title *
          <input name="title" type="text" required placeholder="A clear, descriptive title" />
        </label>
      </div>
      
      <div className="form-section">
        <h4>1. Problem</h4>
        <p className="help-text">Describe the specific problem or use case that motivates this project</p>
        <textarea 
          name="problem" 
          required 
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h4>2. Appetite</h4>
        <p className="help-text">How much time are you willing to spend on this? (e.g., "2 weeks", "6 weeks")</p>
        <input 
          name="appetite" 
          type="text" 
          required 
          placeholder="e.g., 2 weeks, 6 weeks" 
        />
      </div>
      
      <div className="form-section">
        <h4>3. Solution</h4>
        <p className="help-text">Describe the core elements of your solution</p>
        <textarea 
          name="solution" 
          required 
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h4>4. Rabbit Holes</h4>
        <p className="help-text">Details worth calling out to avoid problems</p>
        <textarea 
          name="rabbitHoles" 
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h4>5. No-Gos</h4>
        <p className="help-text">Anything explicitly excluded from the concept</p>
        <textarea 
          name="noGos" 
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>
      
      <div className="form-section">
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
      
      <div className="form-actions">
        <button type="submit" className="submit-btn">Submit Pitch</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </form>
  )
}

const PitchItem = ({ pitch, onSelect, onDelete }: { 
  pitch: Pitch, 
  onSelect: () => void, 
  onDelete: () => void 
}) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className={`pitch-item ${pitch.isSelected ? 'selected' : ''}`}>
      <div className="pitch-header">
        <h4>{pitch.title}</h4>
        <div className="pitch-controls">
          <button onClick={() => setShowDetails(!showDetails)} className="detail-btn">
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          {!pitch.isSelected && (
            <>
              <button onClick={onSelect} className="select-btn">Select</button>
              <button onClick={onDelete} className="delete-btn">Delete</button>
            </>
          )}
        </div>
      </div>
      
      <div className="pitch-meta">
        <span className="appetite-badge">Appetite: {pitch.appetite}</span>
        <span className="date-info">Created: {new Date(pitch.createdAt).toLocaleDateString()}</span>
        {pitch.isSelected && <span className="selected-badge">✓ Selected</span>}
      </div>

      {showDetails && (
        <div className="pitch-details">
          <div className="pitch-section">
            <h5>1. Problem</h5>
            <p>{pitch.problem}</p>
          </div>
          
          <div className="pitch-section">
            <h5>2. Appetite</h5>
            <p>{pitch.appetite}</p>
          </div>
          
          <div className="pitch-section">
            <h5>3. Solution</h5>
            <p>{pitch.solution}</p>
          </div>
          
          {pitch.rabbitHoles && (
            <div className="pitch-section">
              <h5>4. Rabbit Holes</h5>
              <p>{pitch.rabbitHoles}</p>
            </div>
          )}
          
          {pitch.noGos && (
            <div className="pitch-section">
              <h5>5. No-Gos</h5>
              <p>{pitch.noGos}</p>
            </div>
          )}
          
          {pitch.audience && (
            <div className="pitch-section">
              <h5>Target Audience</h5>
              <p>{pitch.audience}</p>
            </div>
          )}
          
          {pitch.insights && (
            <div className="pitch-section">
              <h5>Insights</h5>
              <p>{pitch.insights}</p>
            </div>
          )}
          
          {pitch.successMetrics && (
            <div className="pitch-section">
              <h5>Success Metrics</h5>
              <p>{pitch.successMetrics}</p>
            </div>
          )}
        </div>
      )}
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
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-footer">
        <span className="task-status">Status: {task.status}</span>
        <span className="task-date">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
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
      <button onClick={() => setIsAdding(true)} className="add-task-btn">
        + Add Task
      </button>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="new-task-form">
      <input name="title" type="text" required placeholder="Task title" />
      <input name="description" type="text" placeholder="Task description (optional)" />
      <div className="form-actions">
        <button type="submit" className="submit-task-btn">Add</button>
        <button type="button" onClick={() => setIsAdding(false)} className="cancel-btn">Cancel</button>
      </div>
    </form>
  )
}

const ProjectView = ({ project }: { project: Project }) => {
  const [activeTab, setActiveTab] = useState<'pitches' | 'tasks'>('pitches')
  const [showNewPitchForm, setShowNewPitchForm] = useState(false)
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false)
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject({ id: project.id })
      } catch (err: any) {
        window.alert('Error deleting project: ' + err.message)
      }
    }
  }

  const handleSelectPitch = async (pitchId: number) => {
    try {
      await selectPitch({ id: pitchId, projectId: project.id })
    } catch (err: any) {
      window.alert('Error selecting pitch: ' + err.message)
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

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <div className="project-actions">
          <button onClick={handleDelete} className="delete-btn">Delete Project</button>
        </div>
      </div>
      
      {project.description && <p className="project-description">{project.description}</p>}
      
      <div className="project-meta">
        <p className="task-count">Tasks: {project.tasks?.length || 0}</p>
        <p className="pitch-count">Pitches: {project.pitches?.length || 0}</p>
        <p className="date-info">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'pitches' ? 'active' : ''}`} 
          onClick={() => setActiveTab('pitches')}
        >
          Pitches
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} 
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>
      
      {activeTab === 'pitches' && (
        <div className="pitches-container">
          {!showNewPitchForm ? (
            <button onClick={() => setShowNewPitchForm(true)} className="new-pitch-btn">
              + Create New Pitch
            </button>
          ) : (
            <NewPitchForm 
              projectId={project.id} 
              onCancel={() => setShowNewPitchForm(false)} 
            />
          )}
          
          {project.pitches && project.pitches.length > 0 ? (
            <div className="pitches-list">
              {project.pitches.map((pitch: Pitch) => (
                <PitchItem 
                  key={pitch.id} 
                  pitch={pitch} 
                  onSelect={() => handleSelectPitch(pitch.id)} 
                  onDelete={() => handleDeletePitch(pitch.id)} 
                />
              ))}
            </div>
          ) : (
            <p className="no-pitches">No pitches yet. Create one to get started!</p>
          )}
        </div>
      )}
      
      {activeTab === 'tasks' && (
        <div className="tasks-container">
          <div className="tasks-header">
            <h4>Tasks</h4>
            <div className="tasks-actions">
              <label className="hide-completed-toggle">
                <input 
                  type="checkbox" 
                  checked={hideCompletedTasks} 
                  onChange={e => setHideCompletedTasks(e.target.checked)} 
                />
                Hide completed tasks
              </label>
              <NewTaskForm projectId={project.id} />
            </div>
          </div>
          
          {filteredTasks && filteredTasks.length > 0 ? (
            <div className="task-list">
              {filteredTasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="no-tasks">
              {project.tasks && project.tasks.length > 0 
                ? 'All tasks are completed and hidden.' 
                : 'No tasks yet'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects?.length) return <div className="no-projects">No projects yet. Create one above!</div>

  return (
    <div className="projects-list">
      {projects.map((project) => (
        <ProjectView project={project} key={project.id} />
      ))}
    </div>
  )
}