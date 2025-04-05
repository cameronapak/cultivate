import { Project, Task, Pitch } from 'wasp/entities'
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
  type SelectPitch,
  type DeletePitch,
  type UpdateProject
} from 'wasp/server/operations'

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
    include: { 
      tasks: true,
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

type SelectPitchPayload = {
  id: number
  projectId: number
}

export const selectPitch: SelectPitch<SelectPitchPayload, Pitch> = async (
  args,
  context
) => {
  // Simply mark the pitch as selected
  return context.entities.Pitch.update({
    where: { id: args.id },
    data: { isSelected: true }
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
