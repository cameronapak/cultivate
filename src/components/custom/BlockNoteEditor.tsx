import React, { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "../../client/blocknote.css";

interface BlockNoteEditorProps {
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  debounceDelay?: number;
  initialContent?: string;
  editable?: boolean;
}

const BlockNoteEditorComponent = forwardRef<HTMLDivElement, BlockNoteEditorProps>(
  ({ onChange, value, placeholder, className, name, id, debounceDelay = 500, initialContent, editable = true, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Creates a new editor instance with default settings
    const editor = useCreateBlockNote();

    // For initialization; on mount, convert the initial Markdown to blocks and replace the default editor's content
    React.useEffect(() => {
      async function loadInitialHTML() {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent || "");
        editor.replaceBlocks(editor.document, blocks);
      }

      if (initialContent) {
        loadInitialHTML();
      }
    }, [editor, initialContent]);

    // Debounced onChange handler
    useEffect(() => {
      const handleEditorChange = async () => {
        const markdown = await editor.blocksToMarkdownLossy();
        onChange?.(markdown);
      };

      const editorChangeListener = () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(handleEditorChange, debounceDelay);
      };

      editor.onChange(editorChangeListener);

      // Cleanup function to clear timeout on unmount
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, [editor, onChange, debounceDelay]);

    // Forward the ref to the container div
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    return (
      <div id={id} ref={containerRef} className={`block-note-editor-container ${className || ""}`}>
        <BlockNoteView autoFocus={true} editable={editable} editor={editor} theme="light" />
      </div>
    );
  }
);

BlockNoteEditorComponent.displayName = "BlockNoteEditor";

export { BlockNoteEditorComponent as BlockNoteEditor }; 