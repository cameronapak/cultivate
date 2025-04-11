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
  type UpdateTask,
  type MoveTask,
  type GetInboxTasks,
} from 'wasp/server/operations'

// Define our own GetProject type since we need to include related entities
type GetProject<Input, Output> = (args: Input, context: any) => Output | Promise<Output>

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

type GetProjectInput = {
  projectId: number
}

export const getProject: GetProject<GetProjectInput, Project> = async (args, context) => {
  return context.entities.Project.findUnique({
    where: { id: args.projectId },
    include: { 
      tasks: true,
      resources: true,
      pitch: true
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

export const getInboxTasks: GetInboxTasks<void, Task[]> = async (_args, context) => {
  return context.entities.Task.findMany({
    where: {
      projectId: null
    }
  })
}

// Update CreateTaskPayload to make projectId optional
type CreateTaskPayload = {
  title: string
  description?: string
  projectId?: number // Make projectId optional
}

export const createTask: CreateTask<CreateTaskPayload, Task> = async (
  args,
  context
) => {
  return context.entities.Task.create({
    data: {
      title: args.title,
      description: args.description,
      // Only connect to project if projectId is provided
      ...(args.projectId && {
        project: { connect: { id: args.projectId } }
      })
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

// Add operation to move task to/from inbox
type MoveTaskPayload = {
  id: number
  projectId: number | null // null means move to inbox
}

type MoveTaskArgs = {
  taskId: number
  projectId: number | null
}

export const moveTask: MoveTask<MoveTaskArgs, Task> = async (args, context) => {
  return context.entities.Task.update({
    where: { id: args.taskId },
    data: {
      project: args.projectId ? {
        connect: { id: args.projectId }
      } : {
        disconnect: true
      }
    }
  })
}

export const getDocument = async (args: { documentId: number }, context: any) => {
  return context.entities.Document.findUnique({
    where: { id: args.documentId }
  })
}

export const getDocuments = async (args: {}, context: any) => {
  return context.entities.Document.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export const createDocument = async (args: { title: string; content: string }, context: any) => {
  return context.entities.Document.create({
    data: {
      title: args.title,
      content: args.content
    }
  })
}

export const updateDocument = async (args: { id: number; title: string; content: string }, context: any) => {
  return context.entities.Document.update({
    where: { id: args.id },
    data: {
      title: args.title,
      content: args.content
    }
  })
}

export const deleteDocument = async (args: { id: number }, context: any) => {
  return context.entities.Document.delete({
    where: { id: args.id }
  })
}
