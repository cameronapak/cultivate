import "../Main.css";

export async function setupClient(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (['cultivate-client.fly.dev', 'cultivatepkm.com'].includes(window.location.hostname)) {
    const newUrl = new URL(window.location.pathname + window.location.search, 'https://cultivate.so')
    window.location.replace(newUrl.toString())
  }
} 
