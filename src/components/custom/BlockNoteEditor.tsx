import React, { forwardRef, useImperativeHandle, useRef } from "react";
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
}

const BlockNoteEditorComponent = forwardRef<HTMLDivElement, BlockNoteEditorProps>(
  ({ onChange, value, placeholder, className, name, id, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Creates a new editor instance with default settings
    const editor = useCreateBlockNote();

    // Forward the ref to the container div
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    return (
      <div id={id} ref={containerRef} className={`block-note-editor-container ${className || ""}`}>
        {/* Hidden input field with a default value so form submission works */}
        {name && <input type="hidden" name={name} value={value || "Editor content"} />}
        <BlockNoteView editor={editor} theme="light" />
      </div>
    );
  }
);

BlockNoteEditorComponent.displayName = "BlockNoteEditor";

export { BlockNoteEditorComponent as BlockNoteEditor }; 