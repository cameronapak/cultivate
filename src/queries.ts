import { Project } from 'wasp/entities'
import { type GetProjects } from 'wasp/server/operations'

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
  })
}