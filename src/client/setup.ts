export async function setupClient(): Promise<void> {
  // Check if we're on the old domain
  if (window.location.hostname === 'cultivate-client.fly.dev') {
    // Create new URL with the same path and search params
    const newUrl = new URL(window.location.pathname + window.location.search, 'https://cultivatepkm.com')
    // Redirect to the new domain
    window.location.replace(newUrl.toString())
  }
} 
