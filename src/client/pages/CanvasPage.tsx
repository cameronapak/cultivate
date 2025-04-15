import {
  TLUiComponents,
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
} from "tldraw";
import { throttle } from "../../lib/utils";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  useQuery,
  useAction,
  loadCanvas,
  saveCanvas,
} from "wasp/client/operations";
import "tldraw/tldraw.css";
import { Layout } from "../../components/Layout";
import { useParams } from "react-router-dom";
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
};

export function CanvasPage() {
  const store = useMemo(() => createTLStore(), []);
  const { id } = useParams();
  const canvasId = id ? parseInt(id) : null;

  const [loadingState, setLoadingState] = useState<
    | { status: "loading" }
    | { status: "ready" }
    | { status: "error"; error: string }
  >({
    status: "loading",
  });

  const { data: savedSnapshot, isLoading: isLoadingCanvas } = useQuery(
    loadCanvas,
    { id: canvasId || 0 }
  );
  const saveCanvasToDb = useAction(saveCanvas);

  useLayoutEffect(() => {
    if (isLoadingCanvas) return;

    setLoadingState({ status: "loading" });

    try {
      if (savedSnapshot) {
        loadSnapshot(store, savedSnapshot);
      }
      setLoadingState({ status: "ready" });
    } catch (error: any) {
      setLoadingState({ status: "error", error: error.message });
    }
  }, [store, savedSnapshot, isLoadingCanvas]);

  useLayoutEffect(() => {
    if (!canvasId) return;

    const cleanupFn = store.listen(
      throttle(() => {
        const snapshot = getSnapshot(store);
        saveCanvasToDb({ snapshot, id: canvasId });
      }, 1000)
    );

    return () => {
      cleanupFn();
    };
  }, [store, canvasId, saveCanvasToDb]);

  if (loadingState.status === "loading") {
    return (
      <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
        <div className="tldraw__editor h-full flex items-center justify-center">
          <h2>Loading canvas...</h2>
        </div>
      </Layout>
    );
  }

  if (loadingState.status === "error") {
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
    <Layout 
      mainContentClasses="w-full max-w-full !p-0 h-full"
      breadcrumbItems={[
        {
          title: "Canvas",
          url: "/canvases",
        },
        {
          title: canvasId ? `Canvas ${canvasId}` : "New Canvas",
        },
      ]}
    >
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
