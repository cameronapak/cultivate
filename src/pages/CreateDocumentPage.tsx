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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (!title.trim()) {
        toast.error("Please enter a title");
        return;
      }
      
      const newDocument = await createDocument({ 
        title: title.trim(), 
        content: content || "" 
      });
      navigate(`/documents/${newDocument.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

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
