# Product Requirements Document: MCP Integration for Cultivate

## Introduction / Overview

**Feature Name:** Model Context Protocol (MCP) Integration with Authentication

**Problem Statement:** Users want to interact with Cultivate (create tasks, notes, resources, and search for them) directly from AI applications like Claude without needing to switch to the web interface or copy-paste data.

**Goal:** Build an MCP server that allows authenticated AI clients to safely create and read tasks, notes (thoughts), and resources in Cultivate using a simple API key + session-based authentication approach.

---

## Goals

1. Enable AI clients to create tasks, notes (thoughts), and resources in Cultivate via MCP protocol
2. Enable AI clients to search and retrieve user data (tasks, notes, resources) with multiple search options
3. Implement a simple, secure authentication layer using API keys and user session validation
4. Build an MVP that can be iterated on within 1-2 weeks
5. Maintain data isolation—users can only access their own data
6. Use basic field sets to keep implementation simple (title + content/URL only)

---

## User Stories

**As a** user of an AI application (e.g., Claude),
**I want to** create a task in my Cultivate inbox by saying "add a task: buy groceries",
**So that** I don't have to manually switch to Cultivate and create it manually.

---

**As a** user of an AI application,
**I want to** search for all tasks in my Cultivate workspace,
**So that** the AI can find relevant tasks and provide me with information or context.

---

**As a** user of an AI application,
**I want to** search for resources within a specific project,
**So that** the AI can help me find saved articles or links for a project I'm working on.

---

**As a** Cultivate user,
**I want** my data to be protected so that only my authenticated AI session can access my items,
**So that** my privacy and data security are maintained.

---

## Functional Requirements

### Authentication & Authorization

1. The system must issue a unique API key to each user when they request MCP access (store in User table or separate table)
2. Every MCP request must include the API key in an `Authorization: Bearer {api_key}` header
3. The system must validate the API key and retrieve the associated user before processing any request
4. The system must return a 401 error if the API key is missing or invalid
5. The system must return a 403 error if the API key is valid but doesn't have permission for the requested resource

### Creating Items (Tools)

6. MCP tool `create_task` must accept:
   - `title` (required, string)
   - `description` (optional, string)
   - `projectId` (optional, integer) — defaults to user's "Inbox" project if not provided

7. MCP tool `create_note` must accept:
   - `content` (required, string) — the note text/thought

8. MCP tool `create_resource` must accept:
   - `url` (required, string)
   - `title` (optional, string) — defaults to the URL if not provided
   - `description` (optional, string)
   - `projectId` (optional, integer) — defaults to user's "Inbox" project if not provided

9. All create operations must auto-assign the item to the authenticated user
10. All create operations must return the created item's ID and basic metadata

### Searching & Reading Items (Tools)

11. MCP tool `search_all` must accept:
    - `query` (required, string) — free-text search
    - `type` (optional, string) — filter by "task", "note", or "resource"; if omitted, search all types

12. MCP tool `search_project` must accept:
    - `projectId` (required, integer)
    - `query` (optional, string) — free-text search within the project; if omitted, return all items in project
    - `type` (optional, string) — filter by "task", "note", or "resource"

13. MCP tool `search_by_type` must accept:
    - `type` (required, string) — "task", "note", or "resource"
    - `query` (optional, string) — free-text search within that type

14. Search results must return:
    - Item ID
    - Title (or content preview for notes)
    - Type (task/note/resource)
    - Associated project name (if applicable)
    - Created date

15. Search results must be limited to items belonging to the authenticated user only
16. Search results must be paginated (max 50 results per page, with offset/limit parameters)

### MCP Server Structure

17. The MCP server must expose tools in the standard MCP tool definition format
18. The MCP server must implement HTTP transport (not STDIO) so it can be hosted separately
19. The MCP server must validate all inbound requests at the middleware level before processing

---

## Non-Goals (Out of Scope)

- **OAuth 2.1 implementation** — using simple API key auth for MVP
- **Advanced token refresh logic** — API keys don't expire; can be revoked via UI later
- **Real-time bidirectional communication** — MCP is request-response only for this MVP
- **Editing or deleting existing items** — read/create only for MVP
- **Support for nested/complex fields** — basic fields only (title, content, URL)
- **Rate limiting or quota management** — not needed for MVP
- **MCP resource subscriptions** — only tools are exposed initially
- **MCP prompts feature** — focus on tools only

---

## Design Considerations

### User Experience

- Users should be able to generate an API key from a settings page or new MCP settings section
- The API key should be displayed once (copyable) and not retrievable again (for security)
- There should be a way for users to revoke/regenerate their API key

### Naming & Terminology

- Use "Inbox" as the default project name (already exists in Cultivate)
- Use "note" in MCP terminology but map it to "Thought" in the internal data model
- Use consistent naming: "resource" (not "link" or "bookmark")

---

## Technical Considerations

### Architecture

- **Separate MCP HTTP server** running on a different port or endpoint (e.g., `GET /mcp/...` routes)
- **Leverage existing Wasp queries/actions** for business logic — MCP server acts as a thin HTTP wrapper around them
- **Reuse existing database models** (Task, Thought, Resource, Project, User) — no schema changes needed
- **Store API keys** in the existing User table or a new UserMcpKey table

### Implementation Details

- Use `@modelcontextprotocol/sdk` TypeScript package for MCP server
- API key validation middleware should check the `Authorization` header and query the User table
- Search should use existing Prisma `.findMany()` queries with `.contains()` or full-text search where available
- Return clean JSON responses following MCP tool schema

### Dependencies to Add

- `@modelcontextprotocol/sdk` (MCP protocol implementation)
- `jsonwebtoken` (optional, for future OAuth migration; not required for API key approach)

### Database Changes

- Optional: Add `mcpApiKey` field to User model (or create separate UserMcpKey table)
- No changes to existing Task, Thought, Resource, Project models needed

---

## Success Metrics

1. **Feature Completeness:** All 6 MCP tools (create_task, create_note, create_resource, search_all, search_project, search_by_type) are implemented and functional
2. **Authentication Works:** API key validation blocks unauthorized requests (return 401/403 appropriately)
3. **Data Isolation:** Users can only see/modify their own data; no cross-user data leaks
4. **Responsive Searches:** Search queries return results in <500ms
5. **MVP Timeline:** Feature is deployable within 1-2 weeks

---

## Open Questions

1. Should the API key be auto-generated for all users, or only on-demand?

On-demand generation is preferred to avoid unnecessary API key creation for users who may not use the feature.

2. Should there be a UI for managing/viewing MCP API keys, or is backend-only sufficient for MVP?

Yes. Each user will be able to generate a single API key for MCP integration.

3. What's the default "Inbox" project behavior—should it be auto-created for users who don't have one?

No project for a resource, task, or thought is the default, which leads to inbox.

4. Should search be exact-match or fuzzy/partial-match?

fuzzy/partial match is preferred for better user experience.r

5. Should the MCP server be hosted on the same Fly.io deployment as the web app or separate?

Yes, with the web app on fly.io.
