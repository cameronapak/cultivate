import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "wasp/client/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUrl(str: string): boolean {
  // validate the URL has no spaces in it
  if (str.includes(' ')) {
    return false;
  }

  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function getFaviconFromUrl(url: string, size: number = 16) {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

export async function getMetadataFromUrl(url: string): Promise<{
  title: string;
  description: string;
  image: string;
  favicon: string;
  siteName: string;
  url: string;
}> {
  const response = await api.get(`/api/url-metadata?url=${encodeURIComponent(url)}`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch URL metadata');
  }
  return response.data;
}

// Custom throttle function implementation
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        if (lastArgs) func(...lastArgs);
      }, remaining);
    }
  };
};

// Custom debounce function implementation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

export function getAndSetTheme() {
  const theme = getTheme();
  setTheme(theme);
  return theme;
}

export function getTheme() {
  const theme = localStorage.getItem('theme');
  if (!theme) {
    return 'default';
  }
  return theme;
}

export const APP_COLOR_THEMES = [
  'claude',
  'clean-slate',
  'cosmic-night',
  'default',
  'elegant-luxury',
  'graphite',
  'kondoma-grove',
  'modern-minimal',
  'nature',
  'neo-brutalism',
  'ocean-breeze',
  'pastel-dreams',
  't3-chat',
  'tangerine',
  'twitter',
  'vercel',
]

export function getReadableThemeName(themeName: string) {
  return themeName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export function setTheme(themeName: string) {
  // Remove any existing theme link
  const existing = document.getElementById('theme-css') as HTMLLinkElement | null;
  if (existing) {
    existing.remove();
  }

  if (!APP_COLOR_THEMES.includes(themeName)) {
    throw new Error(`Theme ${themeName} not found`);
  }

  // Create new link
  const link = document.createElement('link');
  link.id = 'theme-css';
  link.rel = 'stylesheet';
  link.href = `/themes/${themeName}.css`; // e.g., neo-brutalism.css
  document.head.appendChild(link);

  localStorage.setItem('theme', themeName);
}
