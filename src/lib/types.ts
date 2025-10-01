import { RoughSVG } from 'roughjs/bin/svg';
export type Tool = "select" | "rectangle" | "ellipse" | "line" | "arrow" | "pencil" | "text";
export type Point = { x: number; y: number };
export type ElementId = string;
export type FillStyle = "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
export type Alignment = "left" | "right" | "center-horizontal" | "top" | "bottom" | "center-vertical";
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type Arrowhead = "arrow" | "triangle" | "bar";
export interface ElementProperties {
  stroke: string;
  fill: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number;
}
export interface BaseElement extends ElementProperties {
  id: ElementId;
  x: number;
  y: number;
  width: number;
  height: number;
  seed: number;
  angle: number;
}
export interface RectangleElement extends BaseElement {
  type: "rectangle";
}
export interface EllipseElement extends BaseElement {
  type: "ellipse";
}
export interface LineElement extends BaseElement {
  type: "line";
  points: [Point, Point];
  strokeStyle: StrokeStyle;
}
export interface ArrowElement extends BaseElement {
  type: "arrow";
  points: [Point, Point];
  strokeStyle: StrokeStyle;
  arrowhead: Arrowhead;
}
export interface PencilElement extends Omit<BaseElement, 'fill' | 'fillStyle' | 'roughness'> {
  type: "pencil";
  points: Point[];
}
export interface TextElement extends Omit<BaseElement, 'fill' | 'fillStyle' | 'roughness' | 'strokeWidth'> {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
}
export type DrawingElement = RectangleElement | EllipseElement | LineElement | ArrowElement | PencilElement | TextElement;
export type Action = "drawing" | "moving" | "resizing" | "writing" | "rotating" | "none" | "selecting" | "panning";
export type ResizeHandle = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se" | "rotate";
export type AppState = {
  tool: Tool;
  elements: DrawingElement[];
  selectedElementIds: ElementId[];
  action: Action;
  resizeHandle: ResizeHandle | null;
  startPoint: Point | null;
  currentPoint: Point | null;
  elementWithResizeHandles: DrawingElement | null;
  zoom: number;
  panOffset: Point;
  isPanning: boolean;
  isShiftPressed: boolean;
  isAltPressed: boolean;
};
export type HistoryState = {
  past: DrawingElement[][];
  present: DrawingElement[];
  future: DrawingElement[][];
};
export type StoreState = AppState & HistoryState;
export type StoreActions = {
  setTool: (tool: Tool) => void;
  setElements: (elements: DrawingElement[] | ((prev: DrawingElement[]) => DrawingElement[])) => void;
  setSelectedElementIds: (ids: ElementId[]) => void;
  setAction: (action: Action) => void;
  setResizeHandle: (handle: ResizeHandle | null) => void;
  setStartPoint: (point: Point | null) => void;
  setCurrentPoint: (point: Point | null) => void;
  setElementWithResizeHandles: (element: DrawingElement | null) => void;
  updateElement: (id: ElementId, updater: (element: DrawingElement) => void) => void;
  updateSelectedElementsProperties: (properties: Partial<ElementProperties> | Partial<TextElement> | Partial<LineElement> | Partial<ArrowElement>) => void;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  setPanOffset: (offset: Point | ((prev: Point) => Point)) => void;
  setIsPanning: (isPanning: boolean) => void;
  setIsShiftPressed: (isShiftPressed: boolean) => void;
  setIsAltPressed: (isAltPressed: boolean) => void;
  bringForward: (id: ElementId) => void;
  sendBackward: (id: ElementId) => void;
  alignElements: (alignment: Alignment) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
};
export type DrawStore = StoreState & StoreActions;
export type RoughGenerator = RoughSVG;