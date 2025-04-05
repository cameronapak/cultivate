import { FormEvent, useRef } from 'react'
import { Project } from 'wasp/entities'
import { getProjects, useQuery, createProject, deleteProject } from 'wasp/client/operations'
import './Main.css'

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects)

  return (
    <div>
      {projects && <ProjectsList projects={projects} />}
      <NewProjectForm />
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
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="title" type="text" defaultValue="" required placeholder="Project title" />
      <input name="description" type="text" defaultValue="" placeholder="Project description" />
      <input type="submit" value="Create project" />
    </form>
  )
}

const ProjectView = ({ project }: { project: Project }) => {
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
      <h3>{project.title}</h3>
      {project.description && <p>{project.description}</p>}
      <p className="date-info">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
      <button onClick={handleDelete} className="delete-btn">Delete</button>
    </div>
  )
}

const ProjectsList = ({ projects }: { projects: Project[] }) => {
  if (!projects?.length) return <div>No projects</div>

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectView project={project} key={project.id} />
      ))}
    </div>
  )
}