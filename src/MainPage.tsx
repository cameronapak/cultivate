import { FormEvent, useRef, useState } from 'react'
import { Project as BaseProject, Task } from 'wasp/entities'
import { getProjects, useQuery, createProject, deleteProject, createTask, updateTaskStatus } from 'wasp/client/operations'
import './Main.css'

// Extended Project interface with tasks array
interface Project extends BaseProject {
  tasks?: Task[]
  problem: string | null
  appetite: string | null
  solution: string | null
  rabbitHoles: string | null
  noGos: string | null
  audience: string | null
  insights: string | null
  successMetrics: string | null
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
          Create New Pitch
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
        description: formData.get('description') as string,
        problem: formData.get('problem') as string,
        appetite: formData.get('appetite') as string,
        solution: formData.get('solution') as string,
        rabbitHoles: formData.get('rabbitHoles') as string,
        noGos: formData.get('noGos') as string,
        audience: formData.get('audience') as string,
        insights: formData.get('insights') as string,
        successMetrics: formData.get('successMetrics') as string
      })
      
      formRef.current?.reset()
      onCancel()
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="new-project-form">
      <h2>Create New Pitch</h2>
      
      <div className="form-section">
        <h3>Basic Information</h3>
        <label>
          Project Title *
          <input name="title" type="text" required placeholder="Give your project a clear title" />
        </label>
        
        <label>
          Short Description
          <input name="description" type="text" placeholder="Brief overview of the project" />
        </label>
      </div>
      
      <div className="form-section">
        <h3>1. Problem</h3>
        <p className="help-text">Describe the specific problem or use case that motivates this project</p>
        <textarea 
          name="problem" 
          required 
          placeholder="What specific problem does this solve? Include a clear story showing why the status quo doesn't work."
          rows={4}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h3>2. Appetite</h3>
        <p className="help-text">How much time are you willing to spend on this? (e.g., "2 weeks", "6 weeks")</p>
        <input 
          name="appetite" 
          type="text" 
          required 
          placeholder="e.g., 2 weeks, 6 weeks" 
        />
      </div>
      
      <div className="form-section">
        <h3>3. Solution</h3>
        <p className="help-text">Describe the core elements of your solution</p>
        <textarea 
          name="solution" 
          required 
          placeholder="Outline the key elements of your solution in a way that's easy to understand"
          rows={6}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h3>4. Rabbit Holes</h3>
        <p className="help-text">Details worth calling out to avoid problems</p>
        <textarea 
          name="rabbitHoles" 
          placeholder="What parts of the implementation might be tricky or time-consuming?"
          rows={3}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h3>5. No-Gos</h3>
        <p className="help-text">Anything explicitly excluded from the concept</p>
        <textarea 
          name="noGos" 
          placeholder="What features or use cases are we intentionally NOT addressing?"
          rows={3}
        ></textarea>
      </div>
      
      <div className="form-section">
        <h3>Additional Information</h3>
        
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
        <button type="submit" className="submit-btn">Create Project</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </form>
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
  const [expanded, setExpanded] = useState(false)
  const [showPitch, setShowPitch] = useState(false)
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject({ id: project.id })
      } catch (err: any) {
        window.alert('Error deleting project: ' + err.message)
      }
    }
  }

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <div className="project-controls">
          <button onClick={() => setShowPitch(!showPitch)} className="pitch-btn">
            {showPitch ? 'Hide Pitch' : 'Show Pitch'}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="expand-btn">
            {expanded ? 'Hide Tasks' : 'Show Tasks'}
          </button>
        </div>
      </div>
      
      {project.description && <p className="project-description">{project.description}</p>}
      
      <div className="project-meta">
        {project.appetite && <p className="appetite-badge">Appetite: {project.appetite}</p>}
        <p className="task-count">Tasks: {project.tasks?.length || 0}</p>
        <p className="date-info">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
      </div>
      
      {showPitch && (
        <div className="pitch-details">
          <h4>Project Pitch</h4>
          
          {project.problem && (
            <div className="pitch-section">
              <h5>1. Problem</h5>
              <p>{project.problem}</p>
            </div>
          )}
          
          {project.appetite && (
            <div className="pitch-section">
              <h5>2. Appetite</h5>
              <p>{project.appetite}</p>
            </div>
          )}
          
          {project.solution && (
            <div className="pitch-section">
              <h5>3. Solution</h5>
              <p>{project.solution}</p>
            </div>
          )}
          
          {project.rabbitHoles && (
            <div className="pitch-section">
              <h5>4. Rabbit Holes</h5>
              <p>{project.rabbitHoles}</p>
            </div>
          )}
          
          {project.noGos && (
            <div className="pitch-section">
              <h5>5. No-Gos</h5>
              <p>{project.noGos}</p>
            </div>
          )}
          
          {project.audience && (
            <div className="pitch-section">
              <h5>Target Audience</h5>
              <p>{project.audience}</p>
            </div>
          )}
          
          {project.insights && (
            <div className="pitch-section">
              <h5>Insights</h5>
              <p>{project.insights}</p>
            </div>
          )}
          
          {project.successMetrics && (
            <div className="pitch-section">
              <h5>Success Metrics</h5>
              <p>{project.successMetrics}</p>
            </div>
          )}
        </div>
      )}
      
      {expanded && (
        <div className="tasks-container">
          <h4>Tasks</h4>
          <NewTaskForm projectId={project.id} />
          
          {project.tasks && project.tasks.length > 0 ? (
            <div className="task-list">
              {project.tasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="no-tasks">No tasks yet</p>
          )}
        </div>
      )}
      
      <button onClick={handleDelete} className="delete-btn">Delete Project</button>
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