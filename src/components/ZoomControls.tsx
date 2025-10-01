import { Button } from "@/components/ui/button";
import { useDrawStore } from "@/store/useDrawStore";
import { Plus, Minus } from "lucide-react";
export function ZoomControls() {
  const zoom = useDrawStore((state) => state.zoom);
  const setZoom = useDrawStore((state) => state.setZoom);
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.1));
  const resetZoom = () => setZoom(1);
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-full shadow-md flex items-center p-1">
      <Button variant="ghost" size="icon" onClick={zoomOut} className="rounded-full">
        <Minus className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={resetZoom} className="rounded-full w-16 text-sm">
        {Math.round(zoom * 100)}%
      </Button>
      <Button variant="ghost" size="icon" onClick={zoomIn} className="rounded-full">
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}