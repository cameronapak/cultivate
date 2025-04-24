import { Project, Task, Pitch, Resource, Thought } from 'wasp/entities'
import { HttpError } from 'wasp/server'
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
  type GetInboxResources,
  type MoveResource,
  type GetThoughts,
  type GetThought,
  type CreateThought,
  type UpdateThought,
  type DeleteThought,
} from 'wasp/server/operations'

// Define our own GetProject type since we need to include related entities
type GetProject<Input, Output> = (args: Input, context: any) => Output | Promise<Output>

export const getProjects: GetProjects<void, Project[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
    where: {
      userId: context.user.id
    },
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
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.findUnique({
    where: { id: args.projectId, userId: context.user.id },
    include: { 
      tasks: true,
      resources: true,
      pitch: true,
      thoughts: true
    }
  })
}

type GetProjectTasksInput = {
  projectId: number
}

export const getProjectTasks: GetProjectTasks<GetProjectTasksInput, Task[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Task.findMany({
    where: { 
      projectId: args.projectId,
      userId: context.user.id 
    },
    orderBy: { createdAt: 'desc' }
  })
}

type GetProjectPitchesInput = {
  projectId: number
}

export const getProjectPitches: GetProjectPitches<GetProjectPitchesInput, Pitch[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
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
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.create({
    data: {
      title: args.title,
      description: args.description,
      user: { connect: { id: context.user.id } }
    },
  })
}

type UpdateProjectPayload = {
  id: number
  title?: string
  description?: string
  taskOrder?: number[]
  pinned?: boolean
}

export const updateProject: UpdateProject<UpdateProjectPayload, Project> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.update({
    where: { id: args.id, userId: context.user.id },
    data: {
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.taskOrder && { taskOrder: args.taskOrder }),
      ...(typeof args.pinned === 'boolean' && { pinned: args.pinned })
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
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.delete({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
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
  if (!context.user) {
    throw new HttpError(401)
  }
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
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Pitch.delete({
    where: { id: args.id }
  })
}

export const getInboxTasks: GetInboxTasks<void, Task[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Task.findMany({
    where: {
      projectId: null,
      userId: context.user.id
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
  if (!context.user) {
    throw new HttpError(401)
  }

  // Create the task
  const task = await context.entities.Task.create({
    data: {
      title: args.title,
      description: args.description,
      // Only connect to project if projectId is provided
      ...(args.projectId && {
        project: { connect: { id: args.projectId } }
      }),
      user: { connect: { id: context.user.id } }
    }
  })

  // If the task is associated with a project, update the project's taskOrder
  if (args.projectId) {
    const project = await context.entities.Project.findUnique({
      where: { id: args.projectId },
      select: { taskOrder: true }
    })

    // Append the new task's ID to the taskOrder array
    const updatedTaskOrder = [...(project?.taskOrder || []), task.id]
    
    await context.entities.Project.update({
      where: { id: args.projectId },
      data: { taskOrder: updatedTaskOrder }
    })
  }

  return task
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
  if (!context.user) {
    throw new HttpError(401)
  }
  const updateData: any = { complete: args.complete }
  if (args.status) updateData.status = args.status
  
  const task = await context.entities.Task.update({
    where: { 
      id: args.id,
      userId: context.user.id 
    },
    data: updateData
  })
  return task
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
  if (!context.user) {
    throw new HttpError(401)
  }
  const task = await context.entities.Task.update({
    where: { 
      id: args.id,
      userId: context.user.id 
    },
    data: {
      title: args.title,
      description: args.description
    }
  })
  return task
}

type DeleteTaskPayload = {
  id: number
}

export const deleteTask: DeleteTask<DeleteTaskPayload, Task> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const task = await context.entities.Task.delete({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
  })
  return task
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
  if (!context.user) {
    throw new HttpError(401)
  }
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
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Resource.findMany({
    where: { 
      projectId: args.projectId,
      userId: context.user.id 
    },
    orderBy: { createdAt: 'desc' }
  })
}

type CreateResourcePayload = {
  url: string
  title: string
  description?: string
  projectId?: number
}

export const createResource: CreateResource<CreateResourcePayload, Resource> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  return context.entities.Resource.create({
    data: {
      url: args.url,
      title: args.title,
      description: args.description,
      project: args.projectId ? { connect: { id: args.projectId } } : undefined,
      user: { connect: { id: context.user.id } }
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
  if (!context.user) {
    throw new HttpError(401)
  }
  const resource = await context.entities.Resource.update({
    where: { 
      id: args.id,
      userId: context.user.id 
    },
    data: {
      url: args.url,
      title: args.title,
      description: args.description
    }
  })
  return resource
}

type DeleteResourcePayload = {
  id: number
}

export const deleteResource: DeleteResource<DeleteResourcePayload, Resource> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const resource = await context.entities.Resource.delete({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
  })
  return resource
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
  if (!context.user) {
    throw new HttpError(401)
  }
  const task = await context.entities.Task.update({
    where: { 
      id: args.taskId,
      userId: context.user.id 
    },
    data: {
      projectId: args.projectId || null
    }
  })
  return task
}

export const getDocument = async (args: { documentId: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Document.findUnique({
    where: { 
      id: args.documentId,
      userId: context.user.id 
    }
  })
}

// Add a function to get a public document without auth
export const getPublicDocument = async (args: { documentId: string }, context: any) => {
  // Find document by ID and check if it's published
  const document = await context.entities.Document.findFirst({
    where: {
      id: args.documentId,
      isPublished: true // Only return if document is published
    },
    include: {
      user: {
        select: {
          id: true // Include author's id
        }
      }
    }
  });

  if (!document) {
    throw new HttpError(404, "Document not found or not published");
  }

  return document;
}

export const getDocuments = async (args: {}, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  return context.entities.Document.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export const createDocument = async (args: { title: string; content: string, isPublished?: boolean }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  if (!args.title || !args.content) {
    throw new HttpError(400, "Title and content are required");
  }

  return context.entities.Document.create({
    data: {
      title: args.title,
      content: args.content,
      isPublished: args.isPublished || false,
      user: { connect: { id: context.user.id } }
    }
  })
}

export const updateDocument = async (args: { id: string; title: string; content: string, isPublished?: boolean }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Document.update({
    where: { id: args.id },
    data: {
      title: args.title,
      content: args.content,
      isPublished: args.isPublished || false
    }
  })
}

export const deleteDocument = async (args: { id: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Document.delete({
    where: { id: args.id }
  })
}

//#region Canvas
type SaveCanvasPayload = {
  snapshot: any
  id: string
}

export const saveCanvas = async (args: SaveCanvasPayload, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  if (args.id === "new") {
    throw new HttpError(400, "Canvas ID is required");
  }

  try {
    await context.entities.Canvas.upsert({
      where: { id: args.id },
      update: { 
        snapshot: JSON.stringify(args.snapshot),
        updatedAt: new Date()
      },
      create: { 
        snapshot: JSON.stringify(args.snapshot),
        user: { connect: { id: context.user.id } }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save canvas:', error);
    throw new HttpError(500, 'Failed to save canvas');
  }
};

type LoadCanvasPayload = {
  id: string
}

export const loadCanvas = async (args: LoadCanvasPayload, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  if (!args.id) {
    throw new HttpError(400, "Canvas ID is required");
  }

  // This will load an empty canvas for the user.
  if (args.id === "new") {
    return null;
  }

  try {
    const canvas = await context.entities.Canvas.findUnique({
      where: { id: args.id }
    });

    return canvas;
  } catch (error) {
    console.error('Failed to load canvas:', error);
    throw new HttpError(500, 'Failed to load canvas');
  }
};

export const getCanvases = async (_args: {}, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  try {
    return context.entities.Canvas.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get canvases:', error);
    throw new HttpError(500, 'Failed to get canvases');
  }
};

export const createCanvas = async (args: { title: string, description: string, snapshot: any }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  try {
    const canvas = await context.entities.Canvas.create({
      data: {
        snapshot: JSON.stringify(args.snapshot),
        title: args.title,
        description: args.description,
        user: { connect: { id: context.user.id } }
      }
    });

    return { id: canvas.id };
  } catch (error) {
    console.error('Failed to create canvas:', error);
    throw new HttpError(500, 'Failed to create canvas');
  }
};

export const deleteCanvas = async (args: { id: string }, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  try {
    await context.entities.Canvas.delete({
      where: { id: args.id }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete canvas:', error);
    throw new HttpError(500, 'Failed to delete canvas');
  }
};
//#endregion

export const getInboxResources: GetInboxResources<void, Resource[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  return context.entities.Resource.findMany({
    where: { 
      projectId: null,
      userId: context.user.id 
    },
    orderBy: { createdAt: 'desc' }
  })
}

type MoveResourceArgs = {
  resourceId: number
  projectId: number | null
}

export const moveResource: MoveResource<MoveResourceArgs, Resource> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const resource = await context.entities.Resource.update({
    where: { 
      id: args.resourceId,
      userId: context.user.id 
    },
    data: {
      projectId: args.projectId || null
    }
  })
  return resource
}

type UpdateProjectTaskOrderPayload = {
  projectId: number
  taskOrder: number[]
}

export const updateProjectTaskOrder = async (args: UpdateProjectTaskOrderPayload, context: any) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  // Verify the project belongs to the user
  const project = await context.entities.Project.findUnique({
    where: { 
      id: args.projectId,
      userId: context.user.id 
    }
  })

  if (!project) {
    throw new HttpError(404, 'Project not found')
  }

  // Update the taskOrder
  return context.entities.Project.update({
    where: { id: args.projectId },
    data: {
      taskOrder: args.taskOrder
    }
  })
}

//#region Thoughts
export const getThoughts: GetThoughts<void, Thought[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Thought.findMany({
    where: { 
      userId: context.user.id 
    },
    orderBy: { createdAt: 'desc' }
  })
}

type GetThoughtInput = {
  id: string
}

export const getThought: GetThought<GetThoughtInput, Thought> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const thought = await context.entities.Thought.findUnique({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
  })
  
  if (!thought) {
    throw new HttpError(404, "Thought not found")
  }
  
  return thought
}

type CreateThoughtPayload = {
  content: string
  projectId?: number
}

export const createThought: CreateThought<CreateThoughtPayload, Thought> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  
  return context.entities.Thought.create({
    data: {
      content: args.content,
      user: { connect: { id: context.user.id } },
      ...(args.projectId && { project: { connect: { id: args.projectId } } })
    }
  })
}

type UpdateThoughtPayload = {
  id: string
  content: string
  projectId?: number
}

export const updateThought: UpdateThought<UpdateThoughtPayload, Thought> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  
  const thought = await context.entities.Thought.findUnique({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
  })
  
  if (!thought) {
    throw new HttpError(404, "Thought not found")
  }
  
  return context.entities.Thought.update({
    where: { id: args.id },
    data: {
      content: args.content,
      ...(args.projectId && { projectId: args.projectId })
    }
  })
}

type DeleteThoughtPayload = {
  id: string
}

export const deleteThought: DeleteThought<DeleteThoughtPayload, Thought> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  
  const thought = await context.entities.Thought.findUnique({
    where: { 
      id: args.id,
      userId: context.user.id 
    }
  })
  
  if (!thought) {
    throw new HttpError(404, "Thought not found")
  }
  
  return context.entities.Thought.delete({
    where: { id: args.id }
  })
}
//#endregion
