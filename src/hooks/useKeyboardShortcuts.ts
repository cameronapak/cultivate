import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check each registered shortcut
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;

        if (keyMatch && ctrlMatch && metaMatch) {
          event.preventDefault();
          shortcut.handler();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Helper hook for tab navigation shortcuts
export function useTabShortcuts(handleTabChange: (tab: 'tasks' | 'resources' | 'about') => void) {
  useKeyboardShortcuts([
    {
      key: '1',
      handler: () => handleTabChange('tasks'),
      description: 'Switch to Tasks tab',
    },
    {
      key: '2',
      handler: () => handleTabChange('resources'),
      description: 'Switch to Resources tab',
    },
    {
      key: '3',
      handler: () => handleTabChange('about'),
      description: 'Switch to About tab',
    },
  ]);
}

// Helper hook for command menu shortcuts
export function useCommandMenuShortcuts(setOpen: (open: boolean) => void) {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      handler: () => setOpen((open) => !open),
      description: 'Toggle command menu',
    },
  ]);
}

// Helper hook for sidebar shortcuts
export function useSidebarShortcuts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hideSidebar = searchParams.get('hideSidebar') === 'true';

  const toggleSidebar = () => {
    setSearchParams((prev) => {
      if (hideSidebar) {
        prev.delete('hideSidebar');
      } else {
        prev.set('hideSidebar', 'true');
      }
      return prev;
    });
  };

  useKeyboardShortcuts([
    {
      key: '/',
      ctrlKey: true,
      metaKey: true,
      handler: toggleSidebar,
      description: 'Toggle sidebar',
    },
  ]);

  return { toggleSidebar };
} 