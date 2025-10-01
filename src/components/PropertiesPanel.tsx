import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDrawStore } from "@/store/useDrawStore";
import { Alignment, FillStyle, TextElement, LineElement, ArrowElement, StrokeStyle, Arrowhead } from "@/lib/types";
import { ChevronsUp, ChevronsDown, RotateCcw, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart } from "lucide-react";
const STROKE_COLORS = ["#000000", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
const FILL_COLORS = ["transparent", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
const FILL_STYLES: FillStyle[] = ["hachure", "solid", "zigzag", "cross-hatch", "dots", "dashed", "zigzag-line"];
const FONT_FAMILIES = ["Inter", "Kalam", "Cascadia Code", "Roboto", "Poppins", "Playfair Display", "Mukta Vani", "Noto Serif Gujarati"];
const STROKE_STYLES: StrokeStyle[] = ["solid", "dashed", "dotted"];
const ARROWHEADS: Arrowhead[] = ["arrow", "triangle", "bar"];
export function PropertiesPanel() {
  const selectedElementIds = useDrawStore((state) => state.selectedElementIds);
  const elements = useDrawStore((state) => state.elements);
  const updateSelectedElementsProperties = useDrawStore((state) => state.updateSelectedElementsProperties);
  const bringForward = useDrawStore((state) => state.bringForward);
  const sendBackward = useDrawStore((state) => state.sendBackward);
  const alignElements = useDrawStore((state) => state.alignElements);
  if (selectedElementIds.length === 0) return null;
  const selectedElement = elements.find((el) => el.id === selectedElementIds[0]);
  if (!selectedElement) return null;
  const handleAlignment = (alignment: Alignment) => alignElements(alignment);
  return (
    <Card className="fixed top-1/2 right-4 -translate-y-1/2 z-50 w-fit shadow-lg max-h-[90vh] overflow-y-auto">
      <CardContent className="p-4 flex flex-col items-center gap-6">
        {selectedElementIds.length > 1 ? (
          <div className="flex flex-col gap-2">
            <Label>Align ({selectedElementIds.length})</Label>
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="icon" onClick={() => handleAlignment('left')}><AlignHorizontalJustifyStart className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleAlignment('center-horizontal')}><AlignHorizontalJustifyCenter className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleAlignment('right')}><AlignHorizontalJustifyEnd className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleAlignment('top')}><AlignVerticalJustifyStart className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleAlignment('center-vertical')}><AlignVerticalJustifyCenter className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => handleAlignment('bottom')}><AlignVerticalJustifyEnd className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Stroke</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {STROKE_COLORS.map((color) => (
                  <button key={color} onClick={() => updateSelectedElementsProperties({ stroke: color })} className={`w-6 h-6 rounded-full border-2 ${selectedElement.stroke === color ? 'border-blue-500' : 'border-transparent'} transition-all`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            {'fill' in selectedElement && (
              <div className="space-y-2">
                <Label>Fill</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {FILL_COLORS.map((color) => (
                    <button key={color} onClick={() => updateSelectedElementsProperties({ fill: color })} className={`w-6 h-6 rounded-full border-2 ${selectedElement.fill === color ? 'border-blue-500' : 'border-transparent'} transition-all`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            )}
            {'fillStyle' in selectedElement && (
              <div className="space-y-2 w-40">
                <Label>Fill Style</Label>
                <Select value={selectedElement.fillStyle} onValueChange={(value: FillStyle) => updateSelectedElementsProperties({ fillStyle: value })}>
                  <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
                  <SelectContent>{FILL_STYLES.map((style) => (<SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {(selectedElement.type === 'line' || selectedElement.type === 'arrow') && (
              <div className="space-y-2 w-40">
                <Label>Stroke Style</Label>
                <Select value={(selectedElement as LineElement).strokeStyle} onValueChange={(value: StrokeStyle) => updateSelectedElementsProperties({ strokeStyle: value })}>
                  <SelectTrigger><SelectValue placeholder="Stroke Style" /></SelectTrigger>
                  <SelectContent>{STROKE_STYLES.map((style) => (<SelectItem key={style} value={style} className="capitalize">{style}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {selectedElement.type === 'arrow' && (
              <div className="space-y-2 w-40">
                <Label>Arrowhead</Label>
                <Select value={(selectedElement as ArrowElement).arrowhead} onValueChange={(value: Arrowhead) => updateSelectedElementsProperties({ arrowhead: value })}>
                  <SelectTrigger><SelectValue placeholder="Arrowhead" /></SelectTrigger>
                  <SelectContent>{ARROWHEADS.map((head) => (<SelectItem key={head} value={head} className="capitalize">{head}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {selectedElement.type !== 'text' && (
              <div className="space-y-2 w-40">
                <Label>Stroke Width</Label>
                <Slider value={[selectedElement.strokeWidth]} onValueChange={([value]) => updateSelectedElementsProperties({ strokeWidth: value })} min={1} max={20} step={1} />
              </div>
            )}
            {'roughness' in selectedElement && (
              <div className="space-y-2 w-40">
                <Label>Roughness</Label>
                <Slider value={[selectedElement.roughness]} onValueChange={([value]) => updateSelectedElementsProperties({ roughness: value })} min={0} max={3} step={0.5} />
              </div>
            )}
            {selectedElement.type === 'text' && (
              <>
                <div className="space-y-2 w-40">
                  <Label>Font Size</Label>
                  <Slider value={[(selectedElement as TextElement).fontSize]} onValueChange={([value]) => updateSelectedElementsProperties({ fontSize: value })} min={8} max={128} step={1} />
                </div>
                <div className="space-y-2 w-40">
                  <Label>Font Family</Label>
                  <Select value={(selectedElement as TextElement).fontFamily} onValueChange={(value: string) => updateSelectedElementsProperties({ fontFamily: value })}>
                    <SelectTrigger><SelectValue placeholder="Font" /></SelectTrigger>
                    <SelectContent>{FONT_FAMILIES.map((font) => (<SelectItem key={font} value={font} style={{fontFamily: font}}>{font}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2 w-40">
              <Label>Rotation</Label>
              <Slider value={[selectedElement.angle]} onValueChange={([value]) => updateSelectedElementsProperties({ angle: value })} min={-180} max={180} step={1} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Actions</Label>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => bringForward(selectedElement.id)}><ChevronsUp className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => sendBackward(selectedElement.id)}><ChevronsDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => updateSelectedElementsProperties({ angle: 0 })}><RotateCcw className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}