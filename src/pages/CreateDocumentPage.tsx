import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "wasp/client/operations";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { BlockNoteEditor } from "../components/custom/BlockNoteEditor";
import { toast } from "sonner";

export const CreateDocumentPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newDocument = await createDocument({ 
        title: title.trim() || "untitled document", 
        content: content || "" 
      });
      navigate(`/documents/${newDocument.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+S (Mac) or CTRL+S (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's default save behavior
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, isSubmitting]); // Add dependencies to ensure latest state is used

  return (
    <Layout
      breadcrumbItems={[{ title: "Docs", url: "/documents" }, { title: "New" }]}
      ctaButton={
        <Button 
          type="submit" 
          form="createDocumentForm"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      }
    >
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
              className="w-full bg-background text-2xl font-medium outline-none"
              required
            />
          </div>

          <BlockNoteEditor
            onChange={setContent}
            value={content}
            id="content"
            name="content"
          />
        </form>
      </div>
    </Layout>
  );
};
