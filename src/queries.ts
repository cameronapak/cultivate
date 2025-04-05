import { Project, Task } from 'wasp/entities'
import { type GetProjects, type CreateProject, type DeleteProject, type GetProjectTasks, type CreateTask, type UpdateTaskStatus } from 'wasp/server/operations'

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
    include: { tasks: true }
  })
}

type GetProjectTasksInput = {
  projectId: number
}

export const getProjectTasks: GetProjectTasks<GetProjectTasksInput, Task[]> = async (args, context) => {
  return context.entities.Task.findMany({
    where: { projectId: args.projectId },
    orderBy: { createdAt: 'desc' }
  })
}

type CreateProjectPayload = {
  title: string
  description?: string
  problem: string
  appetite: string
  solution: string
  rabbitHoles?: string
  noGos?: string
  audience?: string
  insights?: string
  successMetrics?: string
}

export const createProject: CreateProject<CreateProjectPayload, Project> = async (
  args,
  context
) => {
  return context.entities.Project.create({
    data: {
      title: args.title,
      description: args.description,
      problem: args.problem,
      appetite: args.appetite,
      solution: args.solution,
      rabbitHoles: args.rabbitHoles,
      noGos: args.noGos,
      audience: args.audience,
      insights: args.insights,
      successMetrics: args.successMetrics
    },
  })
}

type DeleteProjectPayload = {
  id: number
}

export const deleteProject: DeleteProject<DeleteProjectPayload, Project> = async (
  args,
  context
) => {
  return context.entities.Project.delete({
    where: { id: args.id }
  })
}

type CreateTaskPayload = {
  title: string
  description?: string
  projectId: number
}

export const createTask: CreateTask<CreateTaskPayload, Task> = async (
  args,
  context
) => {
  return context.entities.Task.create({
    data: {
      title: args.title,
      description: args.description,
      project: { connect: { id: args.projectId } }
    }
  })
}

type UpdateTaskStatusPayload = {
  id: number
  complete: boolean
  status?: string
}

export const updateTaskStatus: UpdateTaskStatus<UpdateTaskStatusPayload, Task> = async (
  args,
  context
) => {
  const updateData: any = { complete: args.complete }
  if (args.status) updateData.status = args.status
  
  return context.entities.Task.update({
    where: { id: args.id },
    data: updateData
  })
}
