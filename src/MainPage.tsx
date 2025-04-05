import { FormEvent } from 'react'
import { Project } from 'wasp/entities'
import { getProjects, useQuery, createProject } from 'wasp/client/operations'
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
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const target = event.target as HTMLFormElement
      const title = target.title.value
      const description = target.description.value
      target.reset()
      await createProject({ title, description })
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" type="text" defaultValue="" />
      <input name="description" type="text" defaultValue="" />
      <input type="submit" value="Create task" />
    </form>
  )
}

const ProjectView = ({ project }: { project: Project }) => {
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      {project.description && <p>{project.description}</p>}
      <p className="date-info">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
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