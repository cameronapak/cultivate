# Task List: MCP Integration for Cultivate (Revised)

## Relevant Files

- `schema.prisma` - Database schema where API key field will be added to User model
- `src/server/apis/mcp.ts` - MCP tool API implementations (all 6 tools)
- `src/server/apis/mcpMiddleware.ts` - API key validation middleware function
- `src/server/apis/mcpTypes.ts` - TypeScript types for MCP tool inputs/outputs
- `src/server/apis/mcpUtils.ts` - Utility functions for search, validation, etc.
- `src/queries.ts` - Add MCP key management actions/queries
- `src/pages/SettingsPage.tsx` - Settings page where MCP key management UI lives
- `src/client/components/MCPKeyManager.tsx` - Component for managing API keys
- `main.wasp` - Add 6 API declarations (one per tool) + apiNamespace + key management actions/queries
- `migrations/[timestamp]_add_mcp_api_key.sql` - Database migration for API key field
- `src/server/apis/__tests__/mcp.test.ts` - Tests for MCP tools
- `README.md` - Documentation on how to use MCP integration

### Notes

- MCP tools are implemented as Wasp `api` declarations (no separate Express server needed)
- Use `apiNamespace` with `middlewareConfigFn` for API key authentication middleware
- Each tool is a separate API endpoint under `/mcp/*` path
- API keys stored in User model `mcpApiKey` field
- All APIs use `auth: false` and custom API key validation via middleware
- APIs declare `entities` needed (Task, Thought, Resource, Project, User)
- All operations enforce `userId` isolation via API key → user mapping

---

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch: `git checkout -b feature/mcp-integration`

- [ ] 1.0 Database schema and API key storage setup
  - [ ] 1.1 Add `mcpApiKey` field to User model in `schema.prisma` (String?, @unique)
  - [ ] 1.2 Create Prisma migration: `wasp db migrate-dev`
  - [ ] 1.3 Verify schema changes in database using `wasp db studio`

- [ ] 2.0 MCP infrastructure and authentication middleware
  - [ ] 2.1 Create directory structure: `src/server/apis/`
  - [ ] 2.2 Create `src/server/apis/mcpTypes.ts` with TypeScript interfaces for tool inputs/outputs
  - [ ] 2.3 Create `src/server/apis/mcpMiddleware.ts` with API key validation middleware
    - [ ] 2.3.1 Export `mcpAuthMiddleware` function that takes `middlewareConfig`
    - [ ] 2.3.2 Add Express middleware to extract API key from `Authorization: Bearer {key}` header
    - [ ] 2.3.3 Query User by mcpApiKey using Prisma
    - [ ] 2.3.4 Attach user to `req.mcpUser` if valid
    - [ ] 2.3.5 Return 401 if key missing or invalid
  - [ ] 2.4 Create `src/server/apis/mcpUtils.ts` with helper functions
    - [ ] 2.4.1 `sanitizeSearchQuery(query: string)` - handle special chars
    - [ ] 2.4.2 `formatSearchResults(items, type)` - unified result format
    - [ ] 2.4.3 `validatePagination(offset, limit)` - ensure max 50 per page
  - [ ] 2.5 Create `apiNamespace` in `main.wasp` with `middlewareConfigFn: mcpAuthMiddleware` on path `/mcp`

- [ ] 3.0 Implement MCP create tools (create_task, create_note, create_resource)
  - [ ] 3.1 Create `src/server/apis/mcp.ts`
  - [ ] 3.2 Implement `createTaskApi` handler
    - [ ] 3.2.1 Extract userId from `req.mcpUser`
    - [ ] 3.2.2 Parse body: `title` (required), `description`, `projectId`
    - [ ] 3.2.3 Use `context.entities.Task.create()` to create task
    - [ ] 3.2.4 Return JSON with id, title, projectId, createdAt
  - [ ] 3.3 Implement `createNoteApi` handler
    - [ ] 3.3.1 Extract userId from `req.mcpUser`
    - [ ] 3.3.2 Parse body: `content` (required)
    - [ ] 3.3.3 Use `context.entities.Thought.create()` to create note
    - [ ] 3.3.4 Return JSON with id, content, createdAt
  - [ ] 3.4 Implement `createResourceApi` handler
    - [ ] 3.4.1 Extract userId from `req.mcpUser`
    - [ ] 3.4.2 Parse body: `url` (required), `title`, `description`, `projectId`
    - [ ] 3.4.3 Default title to url if not provided
    - [ ] 3.4.4 Use `context.entities.Resource.create()` to create resource
    - [ ] 3.4.5 Return JSON with id, url, title, projectId, createdAt
  - [ ] 3.5 Add 3 `api` declarations to `main.wasp`
    - [ ] 3.5.1 `api mcpCreateTask { fn: ..., httpRoute: (POST, "/mcp/create/task"), entities: [Task, Project], auth: false }`
    - [ ] 3.5.2 `api mcpCreateNote { fn: ..., httpRoute: (POST, "/mcp/create/note"), entities: [Thought], auth: false }`
    - [ ] 3.5.3 `api mcpCreateResource { fn: ..., httpRoute: (POST, "/mcp/create/resource"), entities: [Resource, Project], auth: false }`
  - [ ] 3.6 Test each create tool with curl

- [ ] 4.0 Implement MCP search tools (search_all, search_project, search_by_type)
  - [ ] 4.1 Implement `searchAllApi` handler in `src/server/apis/mcp.ts`
    - [ ] 4.1.1 Extract userId from `req.mcpUser`
    - [ ] 4.1.2 Parse query params: `query`, `type`, `offset`, `limit`
    - [ ] 4.1.3 Query Task, Thought, Resource with ILIKE search on userId
    - [ ] 4.1.4 Filter by type if provided
    - [ ] 4.1.5 Apply pagination (max 50)
    - [ ] 4.1.6 Return unified results array
  - [ ] 4.2 Implement `searchProjectApi` handler
    - [ ] 4.2.1 Extract userId from `req.mcpUser`
    - [ ] 4.2.2 Parse query params: `projectId` (required), `query`, `type`, `offset`, `limit`
    - [ ] 4.2.3 Verify projectId belongs to user
    - [ ] 4.2.4 Query items filtered by projectId and userId
    - [ ] 4.2.5 Apply search if query provided
    - [ ] 4.2.6 Filter by type if provided
    - [ ] 4.2.7 Return unified results array
  - [ ] 4.3 Implement `searchByTypeApi` handler
    - [ ] 4.3.1 Extract userId from `req.mcpUser`
    - [ ] 4.3.2 Parse query params: `type` (required), `query`, `offset`, `limit`
    - [ ] 4.3.3 Query specific entity type by userId
    - [ ] 4.3.4 Apply search if query provided
    - [ ] 4.3.5 Return unified results array
  - [ ] 4.4 Implement ILIKE search logic in utils
    - [ ] 4.4.1 Use Prisma `contains` filter (case-insensitive)
    - [ ] 4.4.2 Search across title, description, content fields
  - [ ] 4.5 Add 3 `api` declarations to `main.wasp`
    - [ ] 4.5.1 `api mcpSearchAll { fn: ..., httpRoute: (GET, "/mcp/search/all"), entities: [Task, Thought, Resource, Project], auth: false }`
    - [ ] 4.5.2 `api mcpSearchProject { fn: ..., httpRoute: (GET, "/mcp/search/project"), entities: [Task, Thought, Resource, Project], auth: false }`
    - [ ] 4.5.3 `api mcpSearchByType { fn: ..., httpRoute: (GET, "/mcp/search/type"), entities: [Task, Thought, Resource, Project], auth: false }`
  - [ ] 4.6 Test each search tool with curl

- [ ] 5.0 Add API key management backend and UI
  - [ ] 5.1 Create backend action in `src/queries.ts`: `generateMcpApiKey`
    - [ ] 5.1.1 Use `crypto.randomBytes(16).toString('hex')`
    - [ ] 5.1.2 Update `context.user.mcpApiKey` via Prisma
    - [ ] 5.1.3 Return the API key
  - [ ] 5.2 Create backend action in `src/queries.ts`: `revokeMcpApiKey`
    - [ ] 5.2.1 Set `context.user.mcpApiKey` to null
    - [ ] 5.2.2 Return success message
  - [ ] 5.3 Create backend query in `src/queries.ts`: `getMcpKeyStatus`
    - [ ] 5.3.1 Return `{ hasKey: !!user.mcpApiKey, createdAt: ... }`
  - [ ] 5.4 Add actions/queries to `main.wasp`
  - [ ] 5.5 Create `src/client/components/MCPKeyManager.tsx`
    - [ ] 5.5.1 Fetch key status
    - [ ] 5.5.2 Generate button → show key once in copyable code block
    - [ ] 5.5.3 Revoke button
    - [ ] 5.5.4 Show creation date
  - [ ] 5.6 Add MCPKeyManager to `src/pages/SettingsPage.tsx`
  - [ ] 5.7 Test key generation and revocation

- [ ] 6.0 Testing and documentation
  - [ ] 6.1 Create `src/server/apis/__tests__/mcp.test.ts`
    - [ ] 6.1.1 Test API key validation (valid, invalid, missing)
    - [ ] 6.1.2 Test all 6 tools with various inputs
    - [ ] 6.1.3 Test data isolation (users can't see each other's data)
  - [ ] 6.2 Update `README.md` with MCP section
    - [ ] 6.2.1 Document all 6 tools with examples
    - [ ] 6.2.2 Explain API key setup
  - [ ] 6.3 Manual E2E test
    - [ ] 6.3.1 Generate API key via UI
    - [ ] 6.3.2 Test all 6 tools with curl
    - [ ] 6.3.3 Verify data isolation
  - [ ] 6.4 Commit and create PR
