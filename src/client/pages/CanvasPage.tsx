import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { Layout } from "../../components/Layout";

export function CanvasPage() {
  return (
    <Layout mainContentClasses="w-full max-w-full !p-0 h-full">
      <div className="tldraw__editor h-full">
        <Tldraw inferDarkMode className="h-full" persistenceKey="example"></Tldraw>
      </div>
    </Layout>
  );
}
