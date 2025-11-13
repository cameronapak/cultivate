import {
  parseJsonRpcRequest,
  createJsonRpcResponse,
  createJsonRpcError,
  JsonRpcErrors,
} from './jsonrpc'
import {
  handleInitialize,
  handleInitialized,
  validateOperationalState,
} from './lifecycle'
import { handleToolsList } from './handlers/tools'
import {
  handleCreateTask,
  handleCreateNote,
  handleCreateResource,
  handleSearchAll,
  handleSearchProject,
  handleSearchByType,
} from './handlers/toolHandlers'
import {
  JsonRpcRequest,
  JsonRpcNotification,
  JsonRpcResponse,
  JsonRpcError,
  InitializeParams,
  ToolCallParams,
  ToolCallResult,
} from './types'

/**
 * Main JSON-RPC message router
 */
export async function handleJsonRpcMessage(
  body: any,
  user: any
): Promise<JsonRpcResponse | JsonRpcError | null> {
  try {
    // Parse the JSON-RPC message
    const message = parseJsonRpcRequest(body)

    // Handle notifications (no response needed)
    if ('method' in message && !('id' in message)) {
      await handleNotification(message as JsonRpcNotification, user)
      return null // No response for notifications
    }

    // Handle requests (need response)
    const request = message as JsonRpcRequest
    return await handleRequest(request, user)
  } catch (error: any) {
    // If error is already a JsonRpcError, return it
    if (error.jsonrpc === '2.0' && error.error) {
      return error as JsonRpcError
    }

    // Otherwise, wrap in internal error
    return JsonRpcErrors.internalError(null, {
      message: error.message || 'Unknown error',
    })
  }
}

/**
 * Handle JSON-RPC requests (expects response)
 */
async function handleRequest(
  request: JsonRpcRequest,
  user: any
): Promise<JsonRpcResponse | JsonRpcError> {
  const { id, method, params } = request

  try {
    switch (method) {
      case 'initialize':
        return handleInitializeRequest(id, params, user)

      case 'tools/list':
        validateOperationalState(user.id)
        return handleToolsListRequest(id)

      case 'tools/call':
        validateOperationalState(user.id)
        return await handleToolsCallRequest(id, params, user)

      default:
        return JsonRpcErrors.methodNotFound(method, id, {
          availableMethods: ['initialize', 'tools/list', 'tools/call'],
        })
    }
  } catch (error: any) {
    // State validation errors
    if (error.message.includes('not initialized')) {
      return JsonRpcErrors.stateError(id, error.message)
    }

    // Tool execution errors
    return JsonRpcErrors.toolExecutionError(id, error.message || 'Tool execution failed', {
      details: error.stack,
    })
  }
}

/**
 * Handle JSON-RPC notifications (no response)
 */
async function handleNotification(notification: JsonRpcNotification, user: any): Promise<void> {
  const { method, params } = notification

  switch (method) {
    case 'notifications/initialized':
      handleInitialized(user.id)
      break

    case 'notifications/cancelled':
      // Handle cancellation if needed
      break

    default:
      // Unknown notification, ignore
      console.warn(`Unknown notification method: ${method}`)
  }
}

/**
 * Handle initialize request
 */
function handleInitializeRequest(
  id: string | number,
  params: any,
  user: any
): JsonRpcResponse | JsonRpcError {
  try {
    const initParams = params as InitializeParams
    const result = handleInitialize(initParams, user.id)
    return createJsonRpcResponse(id, result)
  } catch (error: any) {
    return JsonRpcErrors.internalError(id, { message: error.message })
  }
}

/**
 * Handle tools/list request
 */
function handleToolsListRequest(id: string | number): JsonRpcResponse {
  const result = handleToolsList()
  return createJsonRpcResponse(id, result)
}

/**
 * Handle tools/call request
 */
async function handleToolsCallRequest(
  id: string | number,
  params: any,
  user: any
): Promise<JsonRpcResponse | JsonRpcError> {
  try {
    const toolCall = params as ToolCallParams

    if (!toolCall.name) {
      return JsonRpcErrors.invalidParams(id, { message: 'Tool name is required' })
    }

    const args = toolCall.arguments || {}
    let result: ToolCallResult

    switch (toolCall.name) {
      case 'create_task':
        result = await handleCreateTask(args as { title: string; description?: string; projectId?: number }, user.id)
        break

      case 'create_note':
        result = await handleCreateNote(args as { content: string }, user.id)
        break

      case 'create_resource':
        result = await handleCreateResource(args as { url: string; title?: string; description?: string; projectId?: number }, user.id)
        break

      case 'search_all':
        result = await handleSearchAll(args as { query?: string; type?: string; limit?: number; offset?: number }, user.id)
        break

      case 'search_project':
        result = await handleSearchProject(args as { projectId: number; query?: string; type?: string; limit?: number; offset?: number }, user.id)
        break

      case 'search_by_type':
        result = await handleSearchByType(args as { type: string; query?: string; limit?: number; offset?: number }, user.id)
        break

      default:
        return JsonRpcErrors.methodNotFound(toolCall.name, id, {
          message: `Unknown tool: ${toolCall.name}`,
          availableTools: [
            'create_task',
            'create_note',
            'create_resource',
            'search_all',
            'search_project',
            'search_by_type',
          ],
        })
    }

    return createJsonRpcResponse(id, result)
  } catch (error: any) {
    return JsonRpcErrors.toolExecutionError(id, error.message || 'Tool execution failed', {
      stack: error.stack,
    })
  }
}
