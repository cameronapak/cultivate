import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from 'wasp/entities';
import { createAuthMiddleware } from './middleware';
import * as createTools from './tools/create';
import * as searchTools from './tools/search';
import {
  CreateTaskInputSchema,
  CreateNoteInputSchema,
  CreateResourceInputSchema,
  SearchAllInputSchema,
  SearchProjectInputSchema,
  SearchByTypeInputSchema,
} from './types';

const port = process.env.MCP_SERVER_PORT || 3001;

export function createMcpServer(prisma: PrismaClient) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Auth middleware for all routes
  const authMiddleware = createAuthMiddleware(prisma);

  // Create tools endpoints
  app.post('/tools/create_task', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = CreateTaskInputSchema.parse(req.body);
      const result = await createTools.createTask(prisma, req.user.id, input);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/tools/create_note', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = CreateNoteInputSchema.parse(req.body);
      const result = await createTools.createNote(prisma, req.user.id, input);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/tools/create_resource', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = CreateResourceInputSchema.parse(req.body);
      const result = await createTools.createResource(prisma, req.user.id, input);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Search tools endpoints
  app.post('/tools/search_all', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = SearchAllInputSchema.parse(req.body);
      const results = await searchTools.searchAll(prisma, req.user.id, input);
      res.json({ results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/tools/search_project', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = SearchProjectInputSchema.parse(req.body);
      const results = await searchTools.searchProject(prisma, req.user.id, input);
      res.json({ results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/tools/search_by_type', authMiddleware, async (req: Request, res: Response) => {
    try {
      const input = SearchByTypeInputSchema.parse(req.body);
      const results = await searchTools.searchByType(prisma, req.user.id, input);
      res.json({ results });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Error handler
  app.use((err: any, req: Request, res: Response) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export function startMcpServer(prisma: PrismaClient) {
  const app = createMcpServer(prisma);

  app.listen(port, '127.0.0.1', () => {
    console.log(`MCP server listening on http://127.0.0.1:${port}`);
  });
}
