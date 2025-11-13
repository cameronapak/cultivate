// JSON-RPC 2.0 Types

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: any
}

export interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number
  result: any
}

export interface JsonRpcError {
  jsonrpc: '2.0'
  id: string | number | null
  error: {
    code: number
    message: string
    data?: any
  }
}

export interface JsonRpcNotification {
  jsonrpc: '2.0'
  method: string
  params?: any
}

// JSON-RPC Error Codes
export const JsonRpcErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Server-defined errors
  AUTH_ERROR: -32001,
  TOOL_EXECUTION_ERROR: -32000,
  STATE_ERROR: -32002,
} as const

// MCP Protocol Types

export interface InitializeParams {
  protocolVersion: string
  capabilities: ClientCapabilities
  clientInfo: {
    name: string
    version: string
  }
}

export interface ClientCapabilities {
  experimental?: Record<string, any>
  sampling?: Record<string, any>
  roots?: {
    listChanged?: boolean
  }
}

export interface InitializeResult {
  protocolVersion: string
  capabilities: ServerCapabilities
  serverInfo: {
    name: string
    version: string
  }
}

export interface ServerCapabilities {
  tools?: {
    listChanged?: boolean
  }
  resources?: {
    subscribe?: boolean
    listChanged?: boolean
  }
  prompts?: {
    listChanged?: boolean
  }
  logging?: Record<string, any>
  experimental?: Record<string, any>
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface ToolCallParams {
  name: string
  arguments: Record<string, any>
}

export interface ToolCallResult {
  content: Array<{
    type: 'text' | 'image' | 'resource'
    text?: string
    data?: string
    mimeType?: string
  }>
  isError?: boolean
}

// Connection State
export enum ConnectionState {
  Uninitialized = 'uninitialized',
  Initialized = 'initialized',
  Operational = 'operational',
}

// User context attached to connection
export interface McpContext {
  user: any
  state: ConnectionState
}
