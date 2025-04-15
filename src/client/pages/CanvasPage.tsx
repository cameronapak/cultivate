import { TLUiComponents, Tldraw, useEditor, createTLStore, getSnapshot, loadSnapshot } from "tldraw";
import { useLayoutEffect, useMemo, useState } from 'react';
import "tldraw/tldraw.css";
import { Layout } from "../../components/Layout";
import { throttle } from "../../lib/utils";
/** src: https://tldraw.dev/examples/ui/ui-components-hidden */
const components: Partial<TLUiComponents> = {
	// ContextMenu: null,
	// ActionsMenu: null,
	// HelpMenu: null,
	// ZoomMenu: null,
	// MainMenu: null,
	Minimap: null,
	// StylePanel: null,
	// PageMenu: null,
	// NavigationPanel: null,
	// Toolbar: null,
	// KeyboardShortcutsDialog: null,
	// QuickActions: null,
	// HelperButtons: null,
	DebugPanel: null,
	DebugMenu: null,
	MenuPanel: null,
	TopPanel: null,
	// CursorChatBubble: null,
	RichTextToolbar: null,
	// Dialogs: null,
	// Toasts: null,
}

const PERSISTENCE_KEY = 'shape-up-canvas';

export function CanvasPage() {
  // Create a new store
  const store = useMemo(() => createTLStore(), []);

  // Set up loading state
  const [loadingState, setLoadingState] = useState<
    { status: 'loading' } | { status: 'ready' } | { status: 'error'; error: string }
  >({
    status: 'loading',
  });

  // Handle persistence
  useLayoutEffect(() => {
    setLoadingState({ status: 'loading' });

    // Get persisted data from local storage
    const persistedSnapshot = localStorage.getItem(PERSISTENCE_KEY);

    if (persistedSnapshot) {
      try {
        const snapshot = JSON.parse(persistedSnapshot);
        loadSnapshot(store, snapshot);
        setLoadingState({ status: 'ready' });
      } catch (error: any) {
        setLoadingState({ status: 'error', error: error.message });
      }
    } else {
      setLoadingState({ status: 'ready' });
    }

    // Set up store listener for persistence
    const cleanupFn = store.listen(
      throttle(() => {
        const snapshot = getSnapshot(store);
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot));
      }, 500)
    );

    return () => {
      cleanupFn();
    };
  }, [store]);

  if (loadingState.status === 'loading') {
    return (
      <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
        <div className="tldraw__editor h-full flex items-center justify-center">
          <h2>Loading canvas...</h2>
        </div>
      </Layout>
    );
  }

  if (loadingState.status === 'error') {
    return (
      <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
        <div className="tldraw__editor h-full flex items-center justify-center">
          <h2>Error!</h2>
          <p>{loadingState.error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
      <div className="tldraw__editor h-full">
        <Tldraw 
          className="h-full"
          components={components}
          inferDarkMode 
          store={store}
          options={{ 
            maxPages: 1, 
            maxFilesAtOnce: 0,
            enableToolbarKeyboardShortcuts: false,
          }}
        />
      </div>
    </Layout>
  );
}
