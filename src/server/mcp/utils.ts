import { PrismaClient } from 'wasp/entities';
import { SearchResult } from './types';

export async function searchItems(
  prisma: PrismaClient,
  userId: number,
  options: {
    query?: string;
    type?: 'task' | 'note' | 'resource';
    projectId?: number;
    limit: number;
    offset: number;
  }
): Promise<SearchResult[]> {
  const { query, type, projectId, limit, offset } = options;

  const results: SearchResult[] = [];

  // Search tasks
  if (!type || type === 'task') {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      include: { project: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    results.push(
      ...tasks.map((task) => ({
        id: task.id,
        title: task.title,
        type: 'task' as const,
        projectName: task.project?.title,
        createdAt: task.createdAt.toISOString(),
      }))
    );
  }

  // Search notes/thoughts
  if (!type || type === 'note') {
    const thoughts = await prisma.thought.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
        ...(query && {
          content: { contains: query, mode: 'insensitive' },
        }),
      },
      include: { project: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    results.push(
      ...thoughts.map((thought) => ({
        id: thought.id,
        content: thought.content.substring(0, 100), // Preview
        type: 'note' as const,
        projectName: thought.project?.title,
        createdAt: thought.createdAt.toISOString(),
      }))
    );
  }

  // Search resources
  if (!type || type === 'resource') {
    const resources = await prisma.resource.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { url: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      include: { project: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    results.push(
      ...resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        type: 'resource' as const,
        projectName: resource.project?.title,
        createdAt: resource.createdAt.toISOString(),
      }))
    );
  }

  // Sort combined results by createdAt descending if searching multiple types
  if (!type) {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return results.slice(0, limit);
}

export async function verifyProjectOwnership(
  prisma: PrismaClient,
  projectId: number,
  userId: number
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  return !!project;
}
