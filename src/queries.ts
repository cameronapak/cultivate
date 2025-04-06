import { Project, Task, Pitch, Resource } from 'wasp/entities'
import { 
  type GetProjects, 
  type CreateProject, 
  type DeleteProject, 
  type GetProjectTasks, 
  type CreateTask, 
  type UpdateTaskStatus,
  type GetProjectPitches,
  type CreatePitch,
  type UpdatePitch,
  type DeletePitch,
  type UpdateProject,
  type GetProjectResources,
  type CreateResource,
  type UpdateResource,
  type DeleteResource,
  type DeleteTask,
  type UpdateTask
} from 'wasp/server/operations'

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
    include: { 
      tasks: true,
      pitch: true,
      resources: true
    }
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

type GetProjectPitchesInput = {
  projectId: number
}

export const getProjectPitches: GetProjectPitches<GetProjectPitchesInput, Pitch[]> = async (args, context) => {
  return context.entities.Pitch.findMany({
    where: { projectId: args.projectId },
    orderBy: { createdAt: 'desc' }
  })
}

type CreateProjectPayload = {
  title: string
  description?: string
}

export const createProject: CreateProject<CreateProjectPayload, Project> = async (
  args,
  context
) => {
  return context.entities.Project.create({
    data: {
      title: args.title,
      description: args.description
    },
  })
}

type UpdateProjectPayload = {
  id: number
  title: string
  description?: string
}

export const updateProject: UpdateProject<UpdateProjectPayload, Project> = async (
  args,
  context
) => {
  return context.entities.Project.update({
    where: { id: args.id },
    data: {
      title: args.title,
      description: args.description
    }
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

type CreatePitchPayload = {
  title: string
  problem: string
  appetite: string
  solution: string
  rabbitHoles?: string
  noGos?: string
  audience?: string
  insights?: string
  successMetrics?: string
  projectId: number
}

export const createPitch: CreatePitch<CreatePitchPayload, Pitch> = async (
  args,
  context
) => {
  // First, check if the project already has a pitch
  const existingPitch = await context.entities.Pitch.findUnique({
    where: { projectId: args.projectId }
  });

  // If there's an existing pitch, delete it first
  if (existingPitch) {
    await context.entities.Pitch.delete({
      where: { id: existingPitch.id }
    });
  }

  // Then create the new pitch
  return context.entities.Pitch.create({
    data: {
      title: args.title,
      problem: args.problem,
      appetite: args.appetite,
      solution: args.solution,
      rabbitHoles: args.rabbitHoles,
      noGos: args.noGos,
      audience: args.audience,
      insights: args.insights,
      successMetrics: args.successMetrics,
      project: { connect: { id: args.projectId } }
    }
  })
}

type DeletePitchPayload = {
  id: number
}

export const deletePitch: DeletePitch<DeletePitchPayload, Pitch> = async (
  args,
  context
) => {
  return context.entities.Pitch.delete({
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

type UpdateTaskPayload = {
  id: number
  title: string
  description?: string
}

export const updateTask: UpdateTask<UpdateTaskPayload, Task> = async (
  args,
  context
) => {
  return context.entities.Task.update({
    where: { id: args.id },
    data: {
      title: args.title,
      description: args.description
    }
  })
}

type DeleteTaskPayload = {
  id: number
}

export const deleteTask: DeleteTask<DeleteTaskPayload, Task> = async (
  args,
  context
) => {
  return context.entities.Task.delete({
    where: { id: args.id }
  })
}

type UpdatePitchPayload = {
  id: number
  title: string
  problem: string
  appetite: string
  solution: string
  rabbitHoles?: string
  noGos?: string
  audience?: string
  insights?: string
  successMetrics?: string
}

export const updatePitch: UpdatePitch<UpdatePitchPayload, Pitch> = async (
  args,
  context
) => {
  return context.entities.Pitch.update({
    where: { id: args.id },
    data: {
      title: args.title,
      problem: args.problem,
      appetite: args.appetite,
      solution: args.solution,
      rabbitHoles: args.rabbitHoles,
      noGos: args.noGos,
      audience: args.audience,
      insights: args.insights,
      successMetrics: args.successMetrics
    }
  })
}

type GetProjectResourcesInput = {
  projectId: number
}

export const getProjectResources: GetProjectResources<GetProjectResourcesInput, Resource[]> = async (args, context) => {
  return context.entities.Resource.findMany({
    where: { projectId: args.projectId },
    orderBy: { createdAt: 'desc' }
  })
}

type CreateResourcePayload = {
  url: string
  title: string
  description?: string
  projectId: number
}

export const createResource: CreateResource<CreateResourcePayload, Resource> = async (
  args,
  context
) => {
  return context.entities.Resource.create({
    data: {
      url: args.url,
      title: args.title,
      description: args.description,
      project: { connect: { id: args.projectId } }
    }
  })
}

type UpdateResourcePayload = {
  id: number
  url: string
  title: string
  description?: string
}

export const updateResource: UpdateResource<UpdateResourcePayload, Resource> = async (
  args,
  context
) => {
  return context.entities.Resource.update({
    where: { id: args.id },
    data: {
      url: args.url,
      title: args.title,
      description: args.description
    }
  })
}

type DeleteResourcePayload = {
  id: number
}

export const deleteResource: DeleteResource<DeleteResourcePayload, Resource> = async (
  args,
  context
) => {
  return context.entities.Resource.delete({
    where: { id: args.id }
  })
}
