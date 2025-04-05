import './Main.css'
import { Project } from 'wasp/entities'
import { getProjects, useQuery } from 'wasp/client/operations'

export const MainPage = () => {
  const { data: projects, isLoading, error } = useQuery(getProjects)

  return (
    <div>
      {projects && <ProjectsList projects={projects} />}

      {isLoading && 'Loading...'}
      {error && 'Error: ' + error}
    </div>
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