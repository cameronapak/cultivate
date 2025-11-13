import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface McpContext {
  user?: any;
  entities: any;
}

// Authentication middleware for MCP APIs
export const mcpMiddleware = (config: any) => {
  config.set("cors", {
    origin: "*",
    credentials: true,
  });
  return config;
};

// Helper to validate API key from Authorization header
async function authenticateApiKey(req: Request): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const apiKey = authHeader.substring(7);
  const user = await prisma.user.findUnique({
    where: { mcpApiKey: apiKey },
  });

  if (!user) {
    throw new Error("Invalid API key");
  }

  return user;
}

// MCP Tool: Create Task
export const mcpCreateTask = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { title, description, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: projectId || null,
        userId: user.id,
      },
    });

    res.json({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      createdAt: task.createdAt,
    });
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tool: Create Note
export const mcpCreateNote = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const thought = await prisma.thought.create({
      data: {
        content,
        userId: user.id,
      },
    });

    res.json({
      id: thought.id,
      content: thought.content,
      createdAt: thought.createdAt,
    });
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tool: Create Resource
export const mcpCreateResource = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { url, title, description, projectId } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const resource = await prisma.resource.create({
      data: {
        url,
        title: title || url,
        description,
        projectId: projectId || null,
        userId: user.id,
      },
    });

    res.json({
      id: resource.id,
      url: resource.url,
      title: resource.title,
      projectId: resource.projectId,
      createdAt: resource.createdAt,
    });
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tool: Search All
export const mcpSearchAll = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { query, type, limit = 50, offset = 0 } = req.query;

    const searchLimit = Math.min(Number(limit), 50);
    const searchOffset = Number(offset);

    let results: any[] = [];

    if (!type || type === "task") {
      const where: any = { userId: user.id };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const tasks = await prisma.task.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        tasks.map((task) => ({
          id: task.id,
          title: task.title,
          type: "task",
          projectName: task.project?.title,
          createdAt: task.createdAt,
        }))
      );
    }

    if (!type || type === "note") {
      const where: any = { userId: user.id };
      if (query) {
        where.content = { contains: query as string, mode: "insensitive" };
      }

      const thoughts = await prisma.thought.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        thoughts.map((thought) => ({
          id: thought.id,
          content: thought.content.substring(0, 200),
          type: "note",
          projectName: thought.project?.title,
          createdAt: thought.createdAt,
        }))
      );
    }

    if (!type || type === "resource") {
      const where: any = { userId: user.id };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
          { url: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const resources = await prisma.resource.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        resources.map((resource) => ({
          id: resource.id,
          title: resource.title,
          type: "resource",
          projectName: resource.project?.title,
          createdAt: resource.createdAt,
        }))
      );
    }

    res.json(results.slice(0, searchLimit));
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tool: Search Project
export const mcpSearchProject = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { projectId, query, type, limit = 50, offset = 0 } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
    });

    if (!project || project.userId !== user.id) {
      return res.status(403).json({ error: "Unauthorized: Project does not belong to user" });
    }

    const searchLimit = Math.min(Number(limit), 50);
    const searchOffset = Number(offset);

    let results: any[] = [];

    if (!type || type === "task") {
      const where: any = { userId: user.id, projectId: Number(projectId) };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const tasks = await prisma.task.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        tasks.map((task) => ({
          id: task.id,
          title: task.title,
          type: "task",
          projectName: task.project?.title,
          createdAt: task.createdAt,
        }))
      );
    }

    if (!type || type === "note") {
      const where: any = { userId: user.id, projectId: Number(projectId) };
      if (query) {
        where.content = { contains: query as string, mode: "insensitive" };
      }

      const thoughts = await prisma.thought.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        thoughts.map((thought) => ({
          id: thought.id,
          content: thought.content.substring(0, 200),
          type: "note",
          projectName: thought.project?.title,
          createdAt: thought.createdAt,
        }))
      );
    }

    if (!type || type === "resource") {
      const where: any = { userId: user.id, projectId: Number(projectId) };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
          { url: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const resources = await prisma.resource.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = results.concat(
        resources.map((resource) => ({
          id: resource.id,
          title: resource.title,
          type: "resource",
          projectName: resource.project?.title,
          createdAt: resource.createdAt,
        }))
      );
    }

    res.json(results.slice(0, searchLimit));
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tool: Search By Type
export const mcpSearchByType = async (req: Request, res: Response, context: McpContext) => {
  try {
    const user = await authenticateApiKey(req);
    const { type, query, limit = 50, offset = 0 } = req.query;

    if (!type) {
      return res.status(400).json({ error: "type is required" });
    }

    const searchLimit = Math.min(Number(limit), 50);
    const searchOffset = Number(offset);

    let results: any[] = [];

    if (type === "task") {
      const where: any = { userId: user.id };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const tasks = await prisma.task.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        type: "task",
        projectName: task.project?.title,
        createdAt: task.createdAt,
      }));
    } else if (type === "note") {
      const where: any = { userId: user.id };
      if (query) {
        where.content = { contains: query as string, mode: "insensitive" };
      }

      const thoughts = await prisma.thought.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = thoughts.map((thought) => ({
        id: thought.id,
        content: thought.content.substring(0, 200),
        type: "note",
        projectName: thought.project?.title,
        createdAt: thought.createdAt,
      }));
    } else if (type === "resource") {
      const where: any = { userId: user.id };
      if (query) {
        where.OR = [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
          { url: { contains: query as string, mode: "insensitive" } },
        ];
      }

      const resources = await prisma.resource.findMany({
        where,
        take: searchLimit,
        skip: searchOffset,
        orderBy: { createdAt: "desc" },
        include: { project: true },
      });

      results = resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        type: "resource",
        projectName: resource.project?.title,
        createdAt: resource.createdAt,
      }));
    } else {
      return res.status(400).json({ error: `Invalid type: ${type}` });
    }

    res.json(results);
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};

// MCP Tools List
export const mcpListTools = async (req: Request, res: Response, context: McpContext) => {
  try {
    await authenticateApiKey(req);

    res.json({
      tools: [
        {
          name: "create_task",
          description: "Create a new task in Cultivate",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Task title" },
              description: { type: "string", description: "Task description (optional)" },
              projectId: { type: "number", description: "Project ID (optional, defaults to inbox)" },
            },
            required: ["title"],
          },
        },
        {
          name: "create_note",
          description: "Create a new note (thought) in Cultivate",
          inputSchema: {
            type: "object",
            properties: {
              content: { type: "string", description: "Note content" },
            },
            required: ["content"],
          },
        },
        {
          name: "create_resource",
          description: "Create a new resource (link/bookmark) in Cultivate",
          inputSchema: {
            type: "object",
            properties: {
              url: { type: "string", description: "Resource URL" },
              title: { type: "string", description: "Resource title (optional, defaults to URL)" },
              description: { type: "string", description: "Resource description (optional)" },
              projectId: { type: "number", description: "Project ID (optional, defaults to inbox)" },
            },
            required: ["url"],
          },
        },
        {
          name: "search_all",
          description: "Search across all items (tasks, notes, resources)",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
              type: {
                type: "string",
                enum: ["task", "note", "resource"],
                description: "Filter by type (optional)",
              },
              limit: { type: "number", description: "Max results (default 50, max 50)" },
              offset: { type: "number", description: "Pagination offset (default 0)" },
            },
          },
        },
        {
          name: "search_project",
          description: "Search within a specific project",
          inputSchema: {
            type: "object",
            properties: {
              projectId: { type: "number", description: "Project ID" },
              query: { type: "string", description: "Search query (optional, returns all if omitted)" },
              type: {
                type: "string",
                enum: ["task", "note", "resource"],
                description: "Filter by type (optional)",
              },
              limit: { type: "number", description: "Max results (default 50, max 50)" },
              offset: { type: "number", description: "Pagination offset (default 0)" },
            },
            required: ["projectId"],
          },
        },
        {
          name: "search_by_type",
          description: "Search for items of a specific type",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["task", "note", "resource"],
                description: "Type to search",
              },
              query: { type: "string", description: "Search query (optional, returns all if omitted)" },
              limit: { type: "number", description: "Max results (default 50, max 50)" },
              offset: { type: "number", description: "Pagination offset (default 0)" },
            },
            required: ["type"],
          },
        },
      ],
    });
  } catch (error: any) {
    res.status(error.message.includes("authorization") ? 401 : 500).json({
      error: error.message || "Internal server error",
    });
  }
};
