import { Project } from 'wasp/entities'
import { type GetProjects, type CreateProject } from 'wasp/server/operations'

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
  })
}

type CreateProjectPayload = Pick<Project, 'title' | 'description'>

export const createProject: CreateProject<CreateProjectPayload, Project> = async (
  args,
  context
) => {
  return context.entities.Project.create({
    data: { title: args.title, description: args.description },
  })
}
