import { z } from 'zod';

// Create Tool Inputs
export const CreateTaskInputSchema = z.object({
  title: z.string().describe('Task title'),
  description: z.string().optional().describe('Task description'),
  projectId: z.number().optional().describe('Project ID to assign task to'),
});

export const CreateNoteInputSchema = z.object({
  content: z.string().describe('Note content'),
});

export const CreateResourceInputSchema = z.object({
  url: z.string().url().describe('Resource URL'),
  title: z.string().optional().describe('Resource title'),
  description: z.string().optional().describe('Resource description'),
  projectId: z.number().optional().describe('Project ID to assign resource to'),
});

// Search Tool Inputs
export const SearchAllInputSchema = z.object({
  query: z.string().describe('Search query'),
  type: z.enum(['task', 'note', 'resource']).optional().describe('Filter by type'),
  limit: z.number().default(50).describe('Maximum results to return'),
  offset: z.number().default(0).describe('Offset for pagination'),
});

export const SearchProjectInputSchema = z.object({
  projectId: z.number().describe('Project ID to search within'),
  query: z.string().optional().describe('Search query'),
  type: z.enum(['task', 'note', 'resource']).optional().describe('Filter by type'),
  limit: z.number().default(50).describe('Maximum results to return'),
  offset: z.number().default(0).describe('Offset for pagination'),
});

export const SearchByTypeInputSchema = z.object({
  type: z.enum(['task', 'note', 'resource']).describe('Item type to search'),
  query: z.string().optional().describe('Search query'),
  limit: z.number().default(50).describe('Maximum results to return'),
  offset: z.number().default(0).describe('Offset for pagination'),
});

// Type exports
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;
export type CreateResourceInput = z.infer<typeof CreateResourceInputSchema>;
export type SearchAllInput = z.infer<typeof SearchAllInputSchema>;
export type SearchProjectInput = z.infer<typeof SearchProjectInputSchema>;
export type SearchByTypeInput = z.infer<typeof SearchByTypeInputSchema>;

// Response types
export interface SearchResult {
  id: string | number;
  title?: string;
  content?: string;
  type: 'task' | 'note' | 'resource';
  projectName?: string;
  createdAt: string;
  url?: string;
}

export interface CreateResult {
  id: string | number;
  title?: string;
  content?: string;
  type: 'task' | 'note' | 'resource';
  createdAt: string;
}
