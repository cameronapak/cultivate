import {
  TLUiComponents,
  Tldraw,
  createTLStore,
  getSnapshot,
  loadSnapshot,
  TLUiOverrides,
  TLUiActionsContextType,
} from "tldraw";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "../../components/ui/form";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { SaveIcon } from "lucide-react";

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
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
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
  const hasChanges = useRef(false);

  const {
    data: canvas,
    isLoading: isLoadingCanvas,
    refetch,
  } = useQuery(
    loadCanvas,
    {
      id: canvasId || "",
    },
    // [1] I have disabled this so that it can be fetched once per page load
    // versus once per change. For example, when I save the canvas, it will
    // refetch the canvas data from the database and cause a re-render and
    // sometimes stale data appears on the screen.
    {
      enabled: false,
    }
  );

  const formRef = useRef<HTMLFormElement>(null);
  const formSchema = z.object({
    title: z.string().min(1, { message: "Canvas name is required" }),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: canvas?.title || "",
      description: canvas?.description || "",
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { id } = await createNewCanvas({
        title: form.getValues("title"),
        description: form.getValues("description") || "",
        snapshot: getSnapshot(store),
      });
      navigate(`/canvas/${id}`, { replace: true });
      formRef.current?.reset();
      setIsNameDialogOpen(false);
      toast.success("Canvas created");
    } catch (err: any) {
      toast.error("Error saving canvas: " + err?.message || "Unknown error");
    }
  };

  // See [1]
  useEffect(() => {
    refetch?.();
  }, [refetch]);

  const createNewCanvas = useAction(createCanvas);
  const saveCanvasToDb = useAction(saveCanvas);

  // Create a stable reference to the save function
  const saveCanvasStable = useCallback(
    (id: string, snapshot: any) => {
      saveCanvasToDb({
        id,
        snapshot,
      })
        .catch((error) => {
          toast.error(
            "Error saving canvas: " + error?.message || "Unknown error"
          );
        })
        .finally(() => {
          hasChanges.current = false;
          toast.success("Saved canvas!");
        });
    },
    [saveCanvasToDb] // This dependency is fine since it's memoized
  );

  // Add keyboard shortcut overrides
  const overrides: TLUiOverrides = useMemo(
    () => ({
      actions(editor, actions): TLUiActionsContextType {
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
                setIsNameDialogOpen(true);
              } else {
                saveCanvasStable(canvasId, editor.getSnapshot());
              }
            } catch (error: any) {
              toast.error(error?.message || "Error saving canvas");
            }
          },
        };

        // https://tldraw.dev/docs/persistence#Listening-for-changes
        editor.store.listen((_update) => { hasChanges.current = true }, {
          scope: "document",
          source: "user",
        });

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
      if (canvas) {
        loadSnapshot(store, JSON.parse(canvas.snapshot));
      }

      setLoadingState({ status: "ready" });
    } catch (error: any) {
      setLoadingState({ status: "error", error: error.message });
    }
  }, [store, canvas, isLoadingCanvas]);

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
      isLoading={loadingState.status === "loading" || !canvasId}
      mainContentClasses="w-full max-w-full !p-0 h-full"
      breadcrumbItems={[
        {
          title: "Canvas",
          url: "/canvases",
        },
        {
          title: canvasId ? canvas?.title || "Untitled Canvas" : "New",
        },
      ]}
      ctaButton={
        <Button
          disabled={!hasChanges}
          variant="default"
          onClick={() => {
            if (!canvasId) {
              return;
            }
            saveCanvasStable(canvasId, getSnapshot(store));
          }}
        >
          <SaveIcon className="w-4 h-4" />
          Save
        </Button>
      }
    >
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <Form {...form}>
            <form onSubmit={handleSubmit} ref={formRef}>
              <DialogHeader>
                <DialogTitle>Name Your Canvas</DialogTitle>
                {/* <DialogDescription>
                  You can update the name of the canvas at any time.
                </DialogDescription> */}
              </DialogHeader>
              <DialogDescription className="mt-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Canvas name"
                              autoFocus
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </DialogDescription>
              <DialogFooter className="sm:justify-start">
                <Button type="submit" variant="default">
                  Save
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
