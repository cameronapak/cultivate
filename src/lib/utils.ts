import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "wasp/client/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUrl(str: string): boolean {
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
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
