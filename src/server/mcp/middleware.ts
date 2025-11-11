import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from 'wasp/entities';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function createAuthMiddleware(prisma: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
      }

      const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

      // Validate Origin header to prevent DNS rebinding attacks
      const origin = req.headers.origin;
      if (process.env.NODE_ENV === 'production' && origin) {
        const allowedOrigins = [
          'https://cultivate.so',
          'https://www.cultivate.so',
        ];
        if (!allowedOrigins.includes(origin)) {
          return res.status(403).json({ error: 'Invalid origin' });
        }
      }

      // Query user by API key
      const user = await prisma.user.findUnique({
        where: { mcpApiKey: apiKey },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      // Attach user to request for use in route handlers
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
