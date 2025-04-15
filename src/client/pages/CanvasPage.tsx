import { TLUiComponents, Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Layout } from "../../components/Layout";

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

export function CanvasPage() {
  return (
    <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
      <div className="tldraw__editor h-full">
        <Tldraw 
          className="h-full"
          components={components}
          inferDarkMode 
          persistenceKey="example"
        ></Tldraw>
      </div>
    </Layout>
  );
}
