import { PrismaClient } from 'wasp/entities';
import { CreateTaskInput, CreateNoteInput, CreateResourceInput, CreateResult } from '../types';

export async function createTask(
  prisma: PrismaClient,
  userId: number,
  input: CreateTaskInput
): Promise<CreateResult> {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      userId,
      projectId: input.projectId || null,
    },
  });

  return {
    id: task.id,
    title: task.title,
    type: 'task',
    createdAt: task.createdAt.toISOString(),
  };
}

export async function createNote(
  prisma: PrismaClient,
  userId: number,
  input: CreateNoteInput
): Promise<CreateResult> {
  const thought = await prisma.thought.create({
    data: {
      content: input.content,
      userId,
    },
  });

  return {
    id: thought.id,
    content: thought.content.substring(0, 100),
    type: 'note',
    createdAt: thought.createdAt.toISOString(),
  };
}

export async function createResource(
  prisma: PrismaClient,
  userId: number,
  input: CreateResourceInput
): Promise<CreateResult> {
  const resource = await prisma.resource.create({
    data: {
      url: input.url,
      title: input.title || input.url, // Default to URL if no title provided
      description: input.description,
      userId,
      projectId: input.projectId || null,
    },
  });

  return {
    id: resource.id,
    title: resource.title,
    type: 'resource',
    createdAt: resource.createdAt.toISOString(),
  };
}
