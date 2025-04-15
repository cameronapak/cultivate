import { useAction } from "wasp/client/operations";
import { createCanvas } from "wasp/client/operations";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";

export function CanvasCreatePage() {
  const navigate = useNavigate();
  const createNewCanvas = useAction(createCanvas);

  useEffect(() => {
    const createAndNavigate = async () => {
      const { id } = await createNewCanvas({});
      navigate(`/canvas/${id}`, { replace: true });
    };
    createAndNavigate();
  }, [navigate, createNewCanvas]);

  return (
    <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
      <div className="h-full flex items-center justify-center">
        <h2>Creating new canvas...</h2>
      </div>
    </Layout>
  );
} 