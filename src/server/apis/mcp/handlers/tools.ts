import { ToolDefinition } from '../types'

/**
 * Get all available tool definitions
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'create_task',
      description: 'Create a new task in Cultivate',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description (optional)' },
          projectId: { type: 'number', description: 'Project ID (optional, defaults to inbox)' },
        },
        required: ['title'],
      },
    },
    {
      name: 'create_note',
      description: 'Create a new note (thought) in Cultivate',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Note content' },
        },
        required: ['content'],
      },
    },
    {
      name: 'create_resource',
      description: 'Create a new resource (link/bookmark) in Cultivate',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Resource URL' },
          title: { type: 'string', description: 'Resource title (optional, defaults to URL)' },
          description: { type: 'string', description: 'Resource description (optional)' },
          projectId: { type: 'number', description: 'Project ID (optional, defaults to inbox)' },
        },
        required: ['url'],
      },
    },
    {
      name: 'search_all',
      description: 'Search across all items (tasks, notes, resources)',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          type: {
            type: 'string',
            enum: ['task', 'note', 'resource'],
            description: 'Filter by type (optional)',
          },
          limit: { type: 'number', description: 'Max results (default 50, max 50)' },
          offset: { type: 'number', description: 'Pagination offset (default 0)' },
        },
      },
    },
    {
      name: 'search_project',
      description: 'Search within a specific project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'number', description: 'Project ID' },
          query: { type: 'string', description: 'Search query (optional, returns all if omitted)' },
          type: {
            type: 'string',
            enum: ['task', 'note', 'resource'],
            description: 'Filter by type (optional)',
          },
          limit: { type: 'number', description: 'Max results (default 50, max 50)' },
          offset: { type: 'number', description: 'Pagination offset (default 0)' },
        },
        required: ['projectId'],
      },
    },
    {
      name: 'search_by_type',
      description: 'Search for items of a specific type',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['task', 'note', 'resource'],
            description: 'Type to search',
          },
          query: { type: 'string', description: 'Search query (optional, returns all if omitted)' },
          limit: { type: 'number', description: 'Max results (default 50, max 50)' },
          offset: { type: 'number', description: 'Pagination offset (default 0)' },
        },
        required: ['type'],
      },
    },
  ]
}

/**
 * Handle tools/list request
 */
export function handleToolsList() {
  return {
    tools: getToolDefinitions(),
  }
}
