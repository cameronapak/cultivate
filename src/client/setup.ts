export async function setupClient(): Promise<void> {
  // Check if we're on the old domain
  if (['cultivate-client.fly.dev', 'cultivatepkm.com'].includes(window.location.hostname)) {
    // Create new URL with the same path and search params
    const newUrl = new URL(window.location.pathname + window.location.search, 'https://cultivate.so')
    // Redirect to the new domain
    window.location.replace(newUrl.toString())
  }
} 
