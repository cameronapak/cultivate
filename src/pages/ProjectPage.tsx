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

  if (error) {
    return null
  }

  if (isLoading || !project) {
    return (
      <Layout
        isLoading={isLoading}
        breadcrumbItems={[
          { title: "Collections", url: "/" },
          { title: "Loading..." },
        ]}
        // Yes, this is redundant, but the component expects children
        children={<></>}
      />
    )
  }

  return (
    <Layout
      isLoading={isLoading}
      breadcrumbItems={[
        { title: "Collections", url: "/" },
        { title: project.title },
      ]}
      activeProjectId={parsedProjectId}
    >
      <ProjectView project={project as Project} />
    </Layout>
  )
}
