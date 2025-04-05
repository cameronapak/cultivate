import { FormEvent, useRef, useState } from 'react'
import { Project as BaseProject, Task } from 'wasp/entities'
import { getProjects, useQuery, createProject, deleteProject, createTask, updateTaskStatus } from 'wasp/client/operations'
import './Main.css'

// Extended Project interface with tasks array
interface Project extends BaseProject {
  tasks?: Task[]
}

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects)

  return (
    <div className="main-container">
      <h1>Shape Up Projects</h1>
      <NewProjectForm />
      {projects && <ProjectsList projects={projects as Project[]} />}
      {isLoading && 'Loading...'}
      {error && 'Error: ' + error}
    </div>
  )
}

const NewProjectForm = () => {
  const formRef = useRef<HTMLFormElement>(null)
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const formData = new FormData(event.currentTarget)
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      formRef.current?.reset()
      await createProject({ title, description })
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="new-project-form">
      <h2>Create New Project</h2>
      <input name="title" type="text" defaultValue="" required placeholder="Project title" />
      <input name="description" type="text" defaultValue="" placeholder="Project description" />
      <input type="submit" value="Create project" className="submit-btn" />
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
        <button onClick={() => setExpanded(!expanded)} className="expand-btn">
          {expanded ? '▼' : '►'}
        </button>
      </div>
      {project.description && <p className="project-description">{project.description}</p>}
      <div className="project-meta">
        <p className="task-count">Tasks: {project.tasks?.length || 0}</p>
        <p className="date-info">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
      </div>
      
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