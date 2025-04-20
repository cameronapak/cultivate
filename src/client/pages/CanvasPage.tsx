import {
  TLUiComponents,
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
  TLUiOverrides,
  TLUiActionsContextType,
} from "tldraw";
import { throttle } from "../../lib/utils";
import { useLayoutEffect, useMemo, useState } from "react";
import {
  useQuery,
  useAction,
  loadCanvas,
  createCanvas,
  saveCanvas,
} from "wasp/client/operations";
import { useNavigate } from "react-router-dom";
import "tldraw/tldraw.css";
import { Layout } from "../../components/Layout";
import { useParams } from "react-router-dom";
import { useTheme } from "../../components/custom/ThemeProvider";
import { toast } from "sonner";

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
  // MenuPanel: null,
  TopPanel: null,
  // CursorChatBubble: null,
  RichTextToolbar: null,
  // Dialogs: null,
  // Toasts: null,
};

export function CanvasPage() {
  const store = useMemo(() => createTLStore(), []);
  const { id: canvasId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loadingState, setLoadingState] = useState<
    | { status: "loading" }
    | { status: "ready" }
    | { status: "error"; error: string }
  >({
    status: "loading",
  });

  const { data: savedSnapshot, isLoading: isLoadingCanvas } = useQuery(
    loadCanvas,
    { id: canvasId || "" }
  );

  const createNewCanvas = useAction(createCanvas);
  const saveCanvasToDb = useAction(saveCanvas);

  // Add keyboard shortcut overrides
  const overrides: TLUiOverrides = useMemo(
    () => ({
      actions(_editor, actions): TLUiActionsContextType {
        // This removes cmd+/,ctrl+/ from toggling dark mode so that its
        // main purpose can continue to be toggling Cultivate's sidebar.
        delete actions["toggle-dark-mode"];

        // Save or create canvas
        actions["save-canvas"] = {
          ...actions["save-canvas"],
          kbd: "cmd+s,ctrl+s",
          async onSelect(_source: any) {
            try {
              if (canvasId === "new" || !canvasId) {
                const { id } = await createNewCanvas({});
                navigate(`/canvas/${id}`, { replace: true });
              } else {
                await saveCanvasToDb({
                  id: canvasId,
                  snapshot: getSnapshot(store),
                });
                toast.success("Saved");
              }
            } catch (error: any) {
              toast.error(error?.message || "Error saving canvas");
            }
          },
        };

        return actions;
      },
    }),
    []
  );

  useLayoutEffect(() => {
    if (isLoadingCanvas) {
      return;
    }

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
      isLoading={loadingState.status === "loading"}
      mainContentClasses="w-full max-w-full !p-0 h-full"
      breadcrumbItems={[
        {
          title: "Canvas",
          url: "/canvases",
        },
        {
          title: canvasId ? `Canvas ${canvasId}` : "New",
        },
      ]}
    >
      <div className="tldraw__editor h-full">
        <Tldraw
          className="h-full"
          components={components}
          inferDarkMode={Boolean(theme === "system" || theme === "dark")}
          store={store}
          overrides={overrides}
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
