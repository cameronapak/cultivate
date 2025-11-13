import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  JsonRpcNotification,
  JsonRpcErrorCode,
} from './types'

/**
 * Validates if a message follows JSON-RPC 2.0 format
 */
export function isValidJsonRpcMessage(message: any): boolean {
  if (!message || typeof message !== 'object') return false
  if (message.jsonrpc !== '2.0') return false
  if (!message.method && message.id === undefined) return false
  return true
}

/**
 * Parses and validates a JSON-RPC request
 */
export function parseJsonRpcRequest(body: any): JsonRpcRequest | JsonRpcNotification {
  if (!isValidJsonRpcMessage(body)) {
    throw createError(
      JsonRpcErrorCode.INVALID_REQUEST,
      'Invalid JSON-RPC 2.0 request format',
      null,
      { received: body }
    )
  }

  // Notification (no id)
  if (body.id === undefined) {
    return {
      jsonrpc: '2.0',
      method: body.method,
      params: body.params,
    } as JsonRpcNotification
  }

  // Request (has id)
  return {
    jsonrpc: '2.0',
    id: body.id,
    method: body.method,
    params: body.params,
  } as JsonRpcRequest
}

/**
 * Creates a successful JSON-RPC response
 */
export function createJsonRpcResponse(id: string | number, result: any): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  }
}

/**
 * Creates a JSON-RPC error response
 */
export function createJsonRpcError(
  code: number,
  message: string,
  id: string | number | null = null,
  data?: any
): JsonRpcError {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data && { data }),
    },
  }
}

/**
 * Helper to create and throw an error object
 */
export function createError(
  code: number,
  message: string,
  id: string | number | null = null,
  data?: any
): JsonRpcError {
  return createJsonRpcError(code, message, id, data)
}

/**
 * Standard error response helpers
 */
export const JsonRpcErrors = {
  parseError: (data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.PARSE_ERROR, 'Parse error', null, data),

  invalidRequest: (id: string | number | null = null, data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.INVALID_REQUEST, 'Invalid request', id, data),

  methodNotFound: (method: string, id: string | number | null, data?: any) =>
    createJsonRpcError(
      JsonRpcErrorCode.METHOD_NOT_FOUND,
      `Method not found: ${method}`,
      id,
      data
    ),

  invalidParams: (id: string | number | null, data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.INVALID_PARAMS, 'Invalid params', id, data),

  internalError: (id: string | number | null, data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.INTERNAL_ERROR, 'Internal error', id, data),

  authError: (id: string | number | null, message: string = 'Authentication failed', data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.AUTH_ERROR, message, id, data),

  toolExecutionError: (id: string | number | null, message: string, data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.TOOL_EXECUTION_ERROR, message, id, data),

  stateError: (id: string | number | null, message: string, data?: any) =>
    createJsonRpcError(JsonRpcErrorCode.STATE_ERROR, message, id, data),
}
