import {
  ConnectionState,
  InitializeParams,
  InitializeResult,
  ServerCapabilities,
  McpContext,
} from './types'

// Simple in-memory state management (could be Redis for production multi-instance)
const connectionStates = new Map<string, ConnectionState>()

/**
 * Get the current connection state for a user
 */
export function getConnectionState(userId: number): ConnectionState {
  const key = `user-${userId}`
  return connectionStates.get(key) || ConnectionState.Uninitialized
}

/**
 * Set the connection state for a user
 */
export function setConnectionState(userId: number, state: ConnectionState): void {
  const key = `user-${userId}`
  connectionStates.set(key, state)
}

/**
 * Reset connection state (for testing or explicit disconnect)
 */
export function resetConnectionState(userId: number): void {
  const key = `user-${userId}`
  connectionStates.delete(key)
}

/**
 * Handle the initialize request
 */
export function handleInitialize(params: InitializeParams, userId: number): InitializeResult {
  // Validate protocol version
  const supportedVersion = '2024-11-05'
  
  // Store client capabilities if needed (could extend McpContext)
  // For now, just validate and respond

  // Transition state
  setConnectionState(userId, ConnectionState.Initialized)

  const serverCapabilities: ServerCapabilities = {
    tools: {
      listChanged: true, // We can notify when tools change (even if not implemented yet)
    },
  }

  const result: InitializeResult = {
    protocolVersion: supportedVersion,
    capabilities: serverCapabilities,
    serverInfo: {
      name: 'cultivate-mcp-server',
      version: '1.0.0',
    },
  }

  return result
}

/**
 * Handle the initialized notification
 */
export function handleInitialized(userId: number): void {
  const currentState = getConnectionState(userId)
  
  if (currentState !== ConnectionState.Initialized) {
    throw new Error(
      `Invalid state for initialized notification. Expected ${ConnectionState.Initialized}, got ${currentState}`
    )
  }

  // Transition to operational
  setConnectionState(userId, ConnectionState.Operational)
}

/**
 * Validate that connection is in operational state before tool calls
 */
export function validateOperationalState(userId: number): void {
  const state = getConnectionState(userId)
  
  if (state !== ConnectionState.Operational) {
    throw new Error(
      `Connection not initialized. Current state: ${state}. Please send initialize request first.`
    )
  }
}
