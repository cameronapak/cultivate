import { PrismaClient } from '@prisma/client'
import { ToolCallResult } from '../types'

const prisma = new PrismaClient()

/**
 * Handle create_task tool
 */
export async function handleCreateTask(
  args: { title: string; description?: string; projectId?: number },
  userId: number
): Promise<ToolCallResult> {
  const { title, description, projectId } = args

  if (!title) {
    throw new Error('Title is required')
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId: projectId || null,
      userId,
    },
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            task: {
              id: task.id,
              title: task.title,
              description: task.description,
              projectId: task.projectId,
              createdAt: task.createdAt,
            },
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}

/**
 * Handle create_note tool
 */
export async function handleCreateNote(
  args: { content: string },
  userId: number
): Promise<ToolCallResult> {
  const { content } = args

  if (!content) {
    throw new Error('Content is required')
  }

  const thought = await prisma.thought.create({
    data: {
      content,
      userId,
    },
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            note: {
              id: thought.id,
              content: thought.content,
              createdAt: thought.createdAt,
            },
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}

/**
 * Handle create_resource tool
 */
export async function handleCreateResource(
  args: { url: string; title?: string; description?: string; projectId?: number },
  userId: number
): Promise<ToolCallResult> {
  const { url, title, description, projectId } = args

  if (!url) {
    throw new Error('URL is required')
  }

  const resource = await prisma.resource.create({
    data: {
      url,
      title: title || url,
      description,
      projectId: projectId || null,
      userId,
    },
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            resource: {
              id: resource.id,
              url: resource.url,
              title: resource.title,
              description: resource.description,
              projectId: resource.projectId,
              createdAt: resource.createdAt,
            },
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}

/**
 * Handle search_all tool
 */
export async function handleSearchAll(
  args: { query?: string; type?: string; limit?: number; offset?: number },
  userId: number
): Promise<ToolCallResult> {
  const { query, type, limit = 50, offset = 0 } = args

  const searchLimit = Math.min(Number(limit), 50)
  const searchOffset = Number(offset)

  let results: any[] = []

  if (!type || type === 'task') {
    const where: any = { userId }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task',
        projectName: task.project?.title,
        createdAt: task.createdAt,
      }))
    )
  }

  if (!type || type === 'note') {
    const where: any = { userId }
    if (query) {
      where.content = { contains: query, mode: 'insensitive' }
    }

    const thoughts = await prisma.thought.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      thoughts.map((thought) => ({
        id: thought.id,
        content: thought.content.substring(0, 200),
        type: 'note',
        projectName: thought.project?.title,
        createdAt: thought.createdAt,
      }))
    )
  }

  if (!type || type === 'resource') {
    const where: any = { userId }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { url: { contains: query, mode: 'insensitive' } },
      ]
    }

    const resources = await prisma.resource.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        description: resource.description,
        type: 'resource',
        projectName: resource.project?.title,
        createdAt: resource.createdAt,
      }))
    )
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            results: results.slice(0, searchLimit),
            count: results.length,
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}

/**
 * Handle search_project tool
 */
export async function handleSearchProject(
  args: { projectId: number; query?: string; type?: string; limit?: number; offset?: number },
  userId: number
): Promise<ToolCallResult> {
  const { projectId, query, type, limit = 50, offset = 0 } = args

  if (!projectId) {
    throw new Error('projectId is required')
  }

  // Verify project belongs to user
  const project = await prisma.project.findUnique({
    where: { id: Number(projectId), userId },
  })

  if (!project) {
    throw new Error('Project not found or access denied')
  }

  const searchLimit = Math.min(Number(limit), 50)
  const searchOffset = Number(offset)

  let results: any[] = []

  if (!type || type === 'task') {
    const where: any = { userId, projectId: Number(projectId) }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task',
        projectName: task.project?.title,
        createdAt: task.createdAt,
      }))
    )
  }

  if (!type || type === 'note') {
    const where: any = { userId, projectId: Number(projectId) }
    if (query) {
      where.content = { contains: query, mode: 'insensitive' }
    }

    const thoughts = await prisma.thought.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      thoughts.map((thought) => ({
        id: thought.id,
        content: thought.content.substring(0, 200),
        type: 'note',
        projectName: thought.project?.title,
        createdAt: thought.createdAt,
      }))
    )
  }

  if (!type || type === 'resource') {
    const where: any = { userId, projectId: Number(projectId) }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { url: { contains: query, mode: 'insensitive' } },
      ]
    }

    const resources = await prisma.resource.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = results.concat(
      resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        description: resource.description,
        type: 'resource',
        projectName: resource.project?.title,
        createdAt: resource.createdAt,
      }))
    )
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            projectName: project.title,
            results: results.slice(0, searchLimit),
            count: results.length,
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}

/**
 * Handle search_by_type tool
 */
export async function handleSearchByType(
  args: { type: string; query?: string; limit?: number; offset?: number },
  userId: number
): Promise<ToolCallResult> {
  const { type, query, limit = 50, offset = 0 } = args

  if (!type) {
    throw new Error('type is required')
  }

  const searchLimit = Math.min(Number(limit), 50)
  const searchOffset = Number(offset)

  let results: any[] = []

  if (type === 'task') {
    const where: any = { userId }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: 'task',
      projectName: task.project?.title,
      createdAt: task.createdAt,
    }))
  } else if (type === 'note') {
    const where: any = { userId }
    if (query) {
      where.content = { contains: query, mode: 'insensitive' }
    }

    const thoughts = await prisma.thought.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = thoughts.map((thought) => ({
      id: thought.id,
      content: thought.content.substring(0, 200),
      type: 'note',
      projectName: thought.project?.title,
      createdAt: thought.createdAt,
    }))
  } else if (type === 'resource') {
    const where: any = { userId }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { url: { contains: query, mode: 'insensitive' } },
      ]
    }

    const resources = await prisma.resource.findMany({
      where,
      take: searchLimit,
      skip: searchOffset,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    })

    results = resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      description: resource.description,
      type: 'resource',
      projectName: resource.project?.title,
      createdAt: resource.createdAt,
    }))
  } else {
    throw new Error(`Invalid type: ${type}. Must be 'task', 'note', or 'resource'`)
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            type,
            results,
            count: results.length,
          },
          null,
          2
        ),
      },
    ],
    isError: false,
  }
}
