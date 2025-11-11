import { PrismaClient } from 'wasp/entities';
import { SearchAllInput, SearchProjectInput, SearchByTypeInput, SearchResult } from '../types';
import { searchItems, verifyProjectOwnership } from '../utils';

export async function searchAll(
  prisma: PrismaClient,
  userId: number,
  input: SearchAllInput
): Promise<SearchResult[]> {
  return searchItems(prisma, userId, {
    query: input.query,
    type: input.type,
    limit: Math.min(input.limit, 50),
    offset: input.offset,
  });
}

export async function searchProject(
  prisma: PrismaClient,
  userId: number,
  input: SearchProjectInput
): Promise<SearchResult[]> {
  // Verify user owns this project
  const ownsProject = await verifyProjectOwnership(prisma, input.projectId, userId);
  if (!ownsProject) {
    throw new Error('Unauthorized: Project not found');
  }

  return searchItems(prisma, userId, {
    query: input.query,
    type: input.type,
    projectId: input.projectId,
    limit: Math.min(input.limit, 50),
    offset: input.offset,
  });
}

export async function searchByType(
  prisma: PrismaClient,
  userId: number,
  input: SearchByTypeInput
): Promise<SearchResult[]> {
  return searchItems(prisma, userId, {
    query: input.query,
    type: input.type,
    limit: Math.min(input.limit, 50),
    offset: input.offset,
  });
}
