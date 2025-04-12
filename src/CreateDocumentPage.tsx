import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "wasp/client/operations";
import { Layout } from "./components/Layout";
import { Button } from "./components/ui/button";
import { BlockNoteEditor } from "./components/custom/BlockNoteEditor";

// Add Trix editor declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "trix-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          input?: string;
          placeholder?: string;
          value?: string;
          onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        },
        HTMLElement
      >;
    }
  }
}

export const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDocument = await createDocument({ title, content });
      navigate(`/documents/${newDocument.id}`);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <Layout breadcrumbItems={[{ title: "Docs", url: "/documents" }, { title: "New" }]}>
      <div>
        <form
          onSubmit={handleSubmit}
          id="createDocumentForm"
          className="space-y-4"
        >
          <div className="flex justify-between gap-3 items-center">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-2xl font-medium outline-none"
            />
            <Button type="submit" form="createDocumentForm">
              Save
            </Button>
          </div>

          <BlockNoteEditor onChange={setContent} value={content} id="content" name="content" />
        </form>
      </div>
    </Layout>
  );
};
