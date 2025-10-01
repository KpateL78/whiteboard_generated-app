import { useState } from "react";
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Undo,
  Redo,
  Trash2,
  Menu,
  Pencil,
  MoveUpRight,
  Type,
  FileImage,
  FileCode2,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useDrawStore } from "@/store/useDrawStore";
import { Tool } from "@/lib/types";
export function Toolbar() {
  const tool = useDrawStore((state) => state.tool);
  const setTool = useDrawStore((state) => state.setTool);
  const undo = useDrawStore((state) => state.undo);
  const redo = useDrawStore((state) => state.redo);
  const past = useDrawStore((state) => state.past);
  const future = useDrawStore((state) => state.future);
  const setElements = useDrawStore((state) => state.setElements);
  const takeSnapshot = useDrawStore((state) => state.takeSnapshot);
  const handleClearCanvas = () => {
    takeSnapshot();
    setElements([]);
  };
  const handleExport = (format: 'svg' | 'png') => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (format === 'svg') {
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      download(url, 'edgedraw.svg');
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        download(pngUrl, 'edgedraw.png');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };
  const download = (href: string, name: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
      <div className="p-1.5 bg-card border rounded-full shadow-md flex items-center gap-1">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleExport('png')} className="flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')} className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4" />
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                  Clear Canvas
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your current drawing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearCanvas}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Separator orientation="vertical" className="h-8" />
        <ToggleGroup
          type="single"
          value={tool}
          onValueChange={(value: Tool) => value && setTool(value)}
          className="gap-1"
        >
          <ToggleGroupItem value="select" aria-label="Select" className="rounded-full">
            <MousePointer2 className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="rectangle" aria-label="Rectangle" className="rounded-full">
            <Square className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="ellipse" aria-label="Ellipse" className="rounded-full">
            <Circle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="line" aria-label="Line" className="rounded-full">
            <Minus className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="arrow" aria-label="Arrow" className="rounded-full">
            <MoveUpRight className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="pencil" aria-label="Pencil" className="rounded-full">
            <Pencil className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="text" aria-label="Text" className="rounded-full">
            <Type className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={past.length === 0}
            className="rounded-full"
          >
            <Undo className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-full"
          >
            <Redo className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}