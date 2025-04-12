import { useParams } from 'react-router-dom'
import { useQuery, getProject } from 'wasp/client/operations'
import { ProjectView } from '../components/ProjectView'
import { Layout } from '../components/Layout'
import { Project } from '../types'

export const ProjectPage = () => {
  const { projectId } = useParams()
  const parsedProjectId = parseInt(projectId || '0', 10)

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(getProject, { projectId: parsedProjectId })

  if (isLoading || error || !project) return null

  return (
    <Layout 
      breadcrumbItems={[
        { title: 'Projects', url: '/' },
        { title: project.title }
      ]}
      activeProjectId={parsedProjectId}
    >
      <ProjectView project={project as Project} />
    </Layout>
  )
}
