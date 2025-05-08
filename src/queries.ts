import { Project, Task, Pitch, Resource, Thought, User, InviteCode } from 'wasp/entities'
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
  type GetInboxThoughts,
  type GetInboxResources,
  type MoveResource,
  type GetThoughts,
  type GetThought,
  type CreateThought,
  type UpdateThought,
  type DeleteThought,
  type MoveThought,
  type CheckInviteCode,
  type ClaimInviteCode,
  type GenerateInviteCode
} from 'wasp/server/operations'

// Wasp operation context type (adjust if a more specific type is available)
type WaspContext = any;

// Define our own GetProject type since we need to include related entities
type GetProject<Input, Output> = (args: Input, context: WaspContext) => Output | Promise<Output>

export const getProjects: GetProjects<{ pinned?: boolean }, Project[]> = async (args: { pinned?: boolean }, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  return context.entities.Project.findMany({
    orderBy: { id: 'asc' },
    where: {
      userId: context.user.id,
      ...(args.pinned && { pinned: true })
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

export const getProject: GetProject<GetProjectInput, Project> = async (args: GetProjectInput, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const project = await context.entities.Project.findUnique({
    where: { id: args.projectId, userId: context.user.id },
    include: { 
      tasks: true,
      resources: true,
      pitch: true,
      thoughts: true
    }
  })
  if (!project) {
    throw new HttpError(404, `Project with id ${args.projectId} not found`);
  }
  return project;
}

type GetProjectTasksInput = {
  projectId: number
}

export const getProjectTasks: GetProjectTasks<GetProjectTasksInput, Task[]> = async (args: GetProjectTasksInput, context: WaspContext) => {
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

export const getProjectPitches: GetProjectPitches<GetProjectPitchesInput, Pitch[]> = async (args: GetProjectPitchesInput, context: WaspContext) => {
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
  emoji?: string
}

export const createProject: CreateProject<CreateProjectPayload, Project> = async (
  args: CreateProjectPayload,
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.create({
    data: {
      title: args.title,
      description: args.description,
      emoji: args.emoji,
      user: { connect: { id: context.user.id } }
    },
  })
}

type UpdateProjectPayload = {
  id: number
  title?: string
  description?: string
  emoji?: string | null
  taskOrder?: number[]
  resourceOrder?: number[]
  pinned?: boolean
}

export const updateProject: UpdateProject<UpdateProjectPayload, Project> = async (
  args: UpdateProjectPayload,
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Project.update({
    where: { id: args.id, userId: context.user.id },
    data: {
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.emoji !== undefined && { emoji: args.emoji }),
      ...(args.taskOrder && { taskOrder: args.taskOrder }),
      ...(args.resourceOrder && { resourceOrder: args.resourceOrder }),
      ...(typeof args.pinned === 'boolean' && { pinned: args.pinned })
    }
  })
}

type DeleteProjectPayload = {
  id: number
}

export const deleteProject: DeleteProject<DeleteProjectPayload, Project> = async (
  args: DeleteProjectPayload,
  context: WaspContext
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
  args: CreatePitchPayload,
  context: WaspContext
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
  args: DeletePitchPayload,
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Pitch.delete({
    where: { id: args.id }
  })
}

export const getInboxTasks: GetInboxTasks<{ isAway?: boolean }, Task[]> = async (
  args: { isAway?: boolean } = {},
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const isAway = args.isAway ?? false;
  return context.entities.Task.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway
    }
  })
}

// Away Tasks
export const getAwayTasks = async (_args: void, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Task.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway: true
    }
  })
}

export const sendTaskAway = async (args: { id: number }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Task.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: true }
  })
}

export const returnTaskFromAway = async (args: { id: number }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Task.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: false }
  })
}

// Update CreateTaskPayload to make projectId optional
type CreateTaskPayload = {
  title: string
  description?: string
  projectId?: number // Make projectId optional
}

export const createTask: CreateTask<CreateTaskPayload, Task> = async (
  args: CreateTaskPayload,
  context: WaspContext
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
  args: UpdateTaskStatusPayload,
  context: WaspContext
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
  title?: string
  description?: string
  isAway?: boolean
}

export const updateTask: UpdateTask<UpdateTaskPayload, Task> = async (
  args: UpdateTaskPayload,
  context: WaspContext
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
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(typeof args.isAway === 'boolean' && { isAway: args.isAway })
    }
  })
  return task
}

type DeleteTaskPayload = {
  id: number
}

export const deleteTask: DeleteTask<DeleteTaskPayload, Task> = async (
  args: DeleteTaskPayload,
  context: WaspContext
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
  args: UpdatePitchPayload,
  context: WaspContext
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

export const getProjectResources: GetProjectResources<GetProjectResourcesInput, Resource[]> = async (args: GetProjectResourcesInput, context: WaspContext) => {
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
  args: CreateResourcePayload,
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  // Create the resource
  const resource = await context.entities.Resource.create({
    data: {
      url: args.url,
      title: args.title,
      description: args.description,
      // Only connect to project if projectId is provided
      ...(args.projectId && {
        project: { connect: { id: args.projectId } }
      }),
      user: { connect: { id: context.user.id } }
    }
  })

  // If the resource is associated with a project, update the project's resourceOrder
  if (args.projectId) {
    const project = await context.entities.Project.findUnique({
      where: { id: args.projectId },
      select: { resourceOrder: true }
    })

    // Append the new resource's ID to the resourceOrder array
    const updatedResourceOrder = [...(project?.resourceOrder || []), resource.id]
    
    await context.entities.Project.update({
      where: { id: args.projectId },
      data: { resourceOrder: updatedResourceOrder }
    })
  }

  return resource
}

type UpdateResourcePayload = {
  id: number
  url?: string
  title?: string
  description?: string
  isAway?: boolean
}

export const updateResource: UpdateResource<UpdateResourcePayload, Resource> = async (
  args: UpdateResourcePayload,
  context: WaspContext
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
      ...(args.url && { url: args.url }),
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(typeof args.isAway === 'boolean' && { isAway: args.isAway })
    }
  })
  return resource
}

type DeleteResourcePayload = {
  id: number
}

export const deleteResource: DeleteResource<DeleteResourcePayload, Resource> = async (
  args: DeleteResourcePayload,
  context: WaspContext
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

export const moveTask: MoveTask<MoveTaskArgs, Task> = async (args: MoveTaskArgs, context: WaspContext) => {
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

export const getDocument = async (args: { documentId: string }, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const doc = await context.entities.Document.findUnique({
    where: { 
      id: args.documentId,
      userId: context.user.id 
    }
  })
  if (!doc) {
    throw new HttpError(404, `Document with id ${args.documentId} not found`);
  }
  return doc;
}

// Add a function to get a public document without auth
export const getPublicDocument = async (args: { documentId: string }, context: WaspContext) => {
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

export const getDocuments = async (args: {}, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  return context.entities.Document.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export const createDocument = async (args: { title: string; content: string, isPublished?: boolean }, context: WaspContext) => {
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

export const updateDocument = async (args: { id: string; title: string; content: string, isPublished?: boolean }, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Document.update({
    where: { id: args.id, userId: context.user.id }, // Ensure user owns the document
    data: {
      title: args.title,
      content: args.content,
      isPublished: args.isPublished || false
    }
  })
}

export const deleteDocument = async (args: { id: string }, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Document.delete({
    where: { id: args.id, userId: context.user.id } // Ensure user owns the document
  })
}

//#region Canvas
type SaveCanvasPayload = {
  snapshot: any
  id: string
}

export const saveCanvas = async (args: SaveCanvasPayload, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  if (args.id === "new") {
    throw new HttpError(400, "Canvas ID is required");
  }

  try {
    await context.entities.Canvas.upsert({
      where: { id: args.id, userId: context.user.id }, // Check ownership
      update: { 
        snapshot: JSON.stringify(args.snapshot),
        updatedAt: new Date()
      },
      create: { 
        id: args.id, // Use provided ID for creation
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

export const loadCanvas = async (args: LoadCanvasPayload, context: WaspContext) => {
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
      where: { id: args.id, userId: context.user.id } // Check ownership
    });
    // Don't throw if not found, return null or let the client handle it
    return canvas; 
  } catch (error) {
    console.error('Failed to load canvas:', error);
    throw new HttpError(500, 'Failed to load canvas');
  }
};

export const getCanvases = async (_args: {}, context: WaspContext) => {
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

export const createCanvas = async (args: { title: string, description: string, snapshot: any }, context: WaspContext) => {
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

export const deleteCanvas = async (args: { id: string }, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  try {
    await context.entities.Canvas.delete({
      where: { id: args.id, userId: context.user.id } // Check ownership
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete canvas:', error);
    throw new HttpError(500, 'Failed to delete canvas');
  }
};
//#endregion

export const getInboxResources: GetInboxResources<{ isAway?: boolean }, Resource[]> = async (
  args: { isAway?: boolean } = {},
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const isAway = args.isAway ?? false;
  return context.entities.Resource.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Away Resources
export const getAwayResources = async (_args: void, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Resource.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const sendResourceAway = async (args: { id: number }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Resource.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: true }
  })
}

export const returnResourceFromAway = async (args: { id: number }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Resource.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: false }
  })
}

type MoveResourceArgs = {
  resourceId: number
  projectId: number | null
}

export const moveResource: MoveResource<MoveResourceArgs, Resource> = async (args: MoveResourceArgs, context: WaspContext) => {
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

export const updateProjectTaskOrder = async (args: UpdateProjectTaskOrderPayload, context: WaspContext) => {
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

type UpdateProjectResourceOrderPayload = {
  projectId: number
  resourceOrder: number[]
}

export const updateProjectResourceOrder = async (args: UpdateProjectResourceOrderPayload, context: WaspContext) => {
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

  // Update the resourceOrder
  return context.entities.Project.update({
    where: { id: args.projectId },
    data: {
      resourceOrder: args.resourceOrder
    }
  })
}

//#region Thoughts
export const getThoughts: GetThoughts<void, Thought[]> = async (_args: void, context: WaspContext) => {
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

export const getThought: GetThought<GetThoughtInput, Thought> = async (args: GetThoughtInput, context: WaspContext) => {
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
  args: CreateThoughtPayload,
  context: WaspContext
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
  content?: string
  projectId?: number
  isAway?: boolean
}

export const updateThought: UpdateThought<UpdateThoughtPayload, Thought> = async (
  args: UpdateThoughtPayload,
  context: WaspContext
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
      ...(args.content && { content: args.content }),
      ...(typeof args.isAway === 'boolean' && { isAway: args.isAway }),
      ...(args.projectId && { projectId: args.projectId })
    }
  })
}

type DeleteThoughtPayload = {
  id: string
}

export const deleteThought: DeleteThought<DeleteThoughtPayload, Thought> = async (
  args: DeleteThoughtPayload,
  context: WaspContext
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

type MoveThoughtArgs = {
  thoughtId: string
  projectId: number | null
}

export const moveThought: MoveThought<MoveThoughtArgs, Thought> = async (args: MoveThoughtArgs, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  
  const thought = await context.entities.Thought.findUnique({
    where: { 
      id: args.thoughtId,
      userId: context.user.id 
    }
  })
  
  if (!thought) {
    throw new HttpError(404, "Thought not found")
  }
  
  return context.entities.Thought.update({
    where: { id: args.thoughtId },
    data: {
      projectId: args.projectId || null
    }
  })
}

export const getInboxThoughts: GetInboxThoughts<{ isAway?: boolean }, Thought[]> = async (
  args: { isAway?: boolean } = {},
  context: WaspContext
) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  const isAway = args.isAway ?? false;
  return context.entities.Thought.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Away Thoughts
export const getAwayThoughts = async (_args: void, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401)
  }
  return context.entities.Thought.findMany({
    where: {
      projectId: null,
      userId: context.user.id,
      isAway: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export const sendThoughtAway = async (args: { id: string }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Thought.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: true }
  })
}

export const returnThoughtFromAway = async (args: { id: string }, context: WaspContext) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Thought.update({
    where: { id: args.id, userId: context.user.id },
    data: { isAway: false }
  })
}

//#endregion

//#region Invite Codes

type CheckInviteCodeArgs = {
  code: string;
};

export const checkInviteCode: CheckInviteCode<CheckInviteCodeArgs, InviteCode> = async (args: CheckInviteCodeArgs, context: WaspContext) => {
  const { code } = args;

  if (!code) {
    throw new HttpError(400, 'Invite code is required.');
  }

  const codeEntry = await context.entities.InviteCode.findUnique({
    where: { code },
  });

  if (!codeEntry) {
    throw new HttpError(404, 'Invalid invite code.');
  }

  if (codeEntry.isClaimed) {
    throw new HttpError(400, 'This invite code has already been claimed.');
  }

  // Code is valid and unclaimed
  return codeEntry;
};

type ClaimInviteCodeArgs = {
  code: string;
};

export const claimInviteCode: ClaimInviteCode<ClaimInviteCodeArgs, InviteCode> = async (args: ClaimInviteCodeArgs, context: WaspContext) => {
  if (!context.user) {
    // This action requires authentication because it runs after signup
    throw new HttpError(401, 'User must be logged in to claim an invite code.');
  }
  
  const { code } = args;

  const codeEntry = await context.entities.InviteCode.findUnique({
    where: { code },
  });

  // Basic validation again, though checkInviteCode should have caught most issues
  if (!codeEntry) {
    throw new HttpError(404, 'Invite code not found during claim process.'); 
  }

  if (codeEntry.isClaimed) {
    // Should ideally not happen if checkInviteCode was called just before signup,
    // but handle race conditions just in case.
    throw new HttpError(400, 'This invite code was already claimed.');
  }

  // Mark the code as claimed and link it to the newly signed-up user
  const updatedCode = await context.entities.InviteCode.update({
    where: { id: codeEntry.id },
    data: {
      isClaimed: true,
      claimedByUserId: context.user.id,
    },
  });

  return updatedCode;
};

// Action to generate an invite code
import { randomBytes } from 'crypto' // For generating random codes

type GenerateInviteCodeArgs = void; // No args needed for generation

export const generateInviteCode: GenerateInviteCode<GenerateInviteCodeArgs, InviteCode> = async (_args: GenerateInviteCodeArgs, context: WaspContext) => {
  if (!context.user) {
    throw new HttpError(401, 'User must be logged in to generate invite codes.')
  }

  const userId = context.user.id;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // 1. Find codes generated by this user in the last week
  const codesGeneratedLastWeek = await context.entities.InviteCode.findMany({
    where: {
      generatedByUserId: userId,
      createdAt: {
        gte: oneWeekAgo,
      },
    },
    orderBy: {
      createdAt: 'asc' // Oldest first, might be relevant if returning existing
    }
  });

  // 2. Check if any are unclaimed
  const unclaimedCode = codesGeneratedLastWeek.find((code: InviteCode) => !code.isClaimed);

  if (unclaimedCode) {
    console.log(`Returning existing unclaimed code: ${unclaimedCode.code}`);
    return unclaimedCode; // Return the existing unclaimed code
  }

  // 3. If all recent codes are claimed (or none exist), check rate limit for *new* generation
  if (codesGeneratedLastWeek.length >= 2) {
    throw new HttpError(429, 'You have already generated 2 invite codes this week, and both are claimed or pending. Please wait or have the existing codes used.');
  }

  // 4. Rate limit allows generation, create a new unique code
  console.log("No unclaimed codes found from last week, generating a new one.");
  let newCodeString: string;
  let codeExists = true;
  do {
    newCodeString = randomBytes(8).toString('hex'); // Generate an 8-byte hex string
    const existingCode = await context.entities.InviteCode.findUnique({
      where: { code: newCodeString },
    });
    codeExists = !!existingCode;
  } while (codeExists);

  // Create the new invite code in the database
  const newInviteCode = await context.entities.InviteCode.create({
    data: {
      code: newCodeString,
      generatedByUserId: userId,
    },
  });

  console.log(`Generated new invite code: ${newInviteCode.code}`);
  return newInviteCode;
};

//#endregion
type GlobalSearchInput = {
  query: string;
}

type SearchResult = {
  type: 'task' | 'resource' | 'thought';
  id: string;
  title: string;
  description: string | null;
  projectId: number | null;
  createdAt: Date;
  rank: number;
  url?: string;
  isAway: boolean;
}

// Calculate relevance scores based on match positions and number of matches
const calculateRelevance = (text: string | null, searchTerm: string): number => {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const matches = lowerText.split(lowerTerm).length - 1;
  const position = lowerText.indexOf(lowerTerm);
  return matches * 10 + (position === 0 ? 5 : 0);
};

export const globalSearch = async (args: GlobalSearchInput, context: WaspContext): Promise<SearchResult[]> => {
  if (!context.user) {
    throw new HttpError(401)
  }

  const { query } = args;
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Search tasks
  const tasks = await context.entities.Task.findMany({
    where: {
      userId: context.user.id,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Search resources
  const resources = await context.entities.Resource.findMany({
    where: {
      userId: context.user.id,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { url: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Search thoughts
  const thoughts = await context.entities.Thought.findMany({
    where: {
      userId: context.user.id,
      content: { contains: query, mode: 'insensitive' }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Format and rank results
  const formattedTasks: SearchResult[] = tasks.map((task: Task) => ({
    id: task.id.toString(),
    title: task.title,
    description: task.description,
    type: 'task',
    projectId: task.projectId,
    createdAt: task.createdAt,
    rank: calculateRelevance(task.title, query) + calculateRelevance(task.description, query),
    url: null,
    isAway: task.isAway,
  }));

  const formattedResources: SearchResult[] = resources.map((resource: Resource) => ({
    id: resource.id.toString(),
    title: resource.title,
    description: resource.description,
    type: 'resource',
    projectId: resource.projectId,
    createdAt: resource.createdAt,
    rank: calculateRelevance(resource.title, query) + 
          calculateRelevance(resource.description, query) + 
          calculateRelevance(resource.url, query),
    url: resource.url,
    isAway: resource.isAway,
  }));

  const formattedThoughts: SearchResult[] = thoughts.map((thought: Thought) => ({
    id: thought.id,
    title: thought.content,
    description: null,
    type: 'thought',
    projectId: thought.projectId,
    createdAt: thought.createdAt,
    rank: calculateRelevance(thought.content, query),
    url: null,
    isAway: thought.isAway,
  }));

  // Combine all results and sort by rank (higher rank first) and then by date
  const combinedResults = [...formattedTasks, ...formattedResources, ...formattedThoughts];
  combinedResults.sort((a, b) => {
    if (b.rank !== a.rank) {
      return b.rank - a.rank;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return combinedResults;
};

// Date-filtered paged Away Tasks
export const getAwayTasksByDate = async (
  args: { date: string; cursor?: number; limit?: number },
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { date, cursor, limit = 20 } = args;
  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59.999');
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
    createdAt: { gte: start, lte: end },
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Task.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

// Date-filtered paged Away Resources
export const getAwayResourcesByDate = async (
  args: { date: string; cursor?: number; limit?: number },
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { date, cursor, limit = 20 } = args;
  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59.999');
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
    createdAt: { gte: start, lte: end },
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Resource.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

// Date-filtered paged Away Thoughts
export const getAwayThoughtsByDate = async (
  args: { date: string; cursor?: string; limit?: number },
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { date, cursor, limit = 20 } = args;
  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59.999');
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
    createdAt: { gte: start, lte: end },
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Thought.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

// Paginated Away Tasks
export const getAwayTasksPaginated = async (
  args: { cursor?: number; limit?: number } = {},
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { cursor, limit = 20 } = args;
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Task.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

// Paginated Away Resources
export const getAwayResourcesPaginated = async (
  args: { cursor?: number; limit?: number } = {},
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { cursor, limit = 20 } = args;
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Resource.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

// Paginated Away Thoughts
export const getAwayThoughtsPaginated = async (
  args: { cursor?: string; limit?: number } = {},
  context: WaspContext
) => {
  if (!context.user) throw new HttpError(401);
  const { cursor, limit = 20 } = args;
  const where: any = {
    projectId: null,
    userId: context.user.id,
    isAway: true,
  };
  if (cursor) {
    where.id = { lt: cursor };
  }
  const items = await context.entities.Thought.findMany({
    where,
    orderBy: { id: 'desc' },
    take: limit + 1,
  });
  let nextCursor = null;
  if (items.length > limit) {
    nextCursor = items[limit].id;
    items.pop();
  }
  return { items, nextCursor };
};

export const getOldestAwayDate = async (_args: any, context: WaspContext) => {
  if (!context.user) throw new HttpError(401);

  const [oldestTask] = await context.entities.Task.findMany({
    where: { userId: context.user.id, isAway: true },
    orderBy: { createdAt: 'asc' },
    take: 1,
    select: { createdAt: true },
  });
  const [oldestResource] = await context.entities.Resource.findMany({
    where: { userId: context.user.id, isAway: true },
    orderBy: { createdAt: 'asc' },
    take: 1,
    select: { createdAt: true },
  });
  const [oldestThought] = await context.entities.Thought.findMany({
    where: { userId: context.user.id, isAway: true },
    orderBy: { createdAt: 'asc' },
    take: 1,
    select: { createdAt: true },
  });

  const dates = [oldestTask?.createdAt, oldestResource?.createdAt, oldestThought?.createdAt].filter(Boolean);
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map(d => new Date(d).getTime())));
};
