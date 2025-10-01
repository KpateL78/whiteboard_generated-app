import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';
import { BaseElement, DrawingElement, ElementProperties, Point, RectangleElement, EllipseElement, LineElement, ResizeHandle, ArrowElement, PencilElement, TextElement, Tool } from "./types";
import getStroke from 'perfect-freehand';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function createElement({ x, y, type, properties }: {
  x: number;
  y: number;
  type: Exclude<Tool, 'select'>;
  properties: ElementProperties;
}): DrawingElement {
  const baseElement: Omit<BaseElement, "type"> = {
    id: uuidv4(),
    x,
    y,
    width: 0,
    height: 0,
    angle: 0,
    seed: Math.floor(Math.random() * 10000),
    ...properties,
  };
  switch (type) {
    case "rectangle":
      return { ...baseElement, type: "rectangle" } as RectangleElement;
    case "ellipse":
      return { ...baseElement, type: "ellipse" } as EllipseElement;
    case "line":
      return { ...baseElement, type: "line", points: [{ x: 0, y: 0 }, { x: 0, y: 0 }], strokeStyle: 'solid' } as LineElement;
    case "arrow":
      return { ...baseElement, type: "arrow", points: [{ x: 0, y: 0 }, { x: 0, y: 0 }], strokeStyle: 'solid', arrowhead: 'arrow' } as ArrowElement;
    case "pencil":
      return {
        ...baseElement,
        type: "pencil",
        points: [{ x, y }],
        fill: "transparent", // override
        fillStyle: "solid", // override
        roughness: 0, // override
      } as PencilElement;
    case "text":
      return {
        ...baseElement,
        type: "text",
        text: "Text",
        fontSize: 24,
        fontFamily: "Inter",
        width: 100, // Default width for selection
        height: 24, // Default height matching font size
        fill: "transparent", // override
        fillStyle: "solid", // override
        roughness: 0, // override
        strokeWidth: 0, // override
      } as TextElement;
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x;
  const ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;
  return { x: nx, y: ny };
}
export function isPointInsideElement(point: Point, element: DrawingElement): boolean {
  const { x, y, width, height, angle } = element;
  const center = { x: x + width / 2, y: y + height / 2 };
  const rotatedPoint = rotatePoint(point, center, -angle);
  return rotatedPoint.x >= x && rotatedPoint.x <= x + width && rotatedPoint.y >= y && rotatedPoint.y <= y + height;
}
export function getElementAtPosition(x: number, y: number, elements: DrawingElement[]): DrawingElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (isPointInsideElement({ x, y }, elements[i])) {
      return elements[i];
    }
  }
  return null;
}
export function getResizeHandleAtPosition(point: Point, element: DrawingElement): ResizeHandle | null {
    if (element.type === 'pencil' || element.type === 'text') return null;
    const { x, y, width, height, angle } = element;
    const handleSize = 8;
    const halfHandleSize = handleSize / 2;
    const center = { x: x + width / 2, y: y + height / 2 };
    const handlesDef: { position: ResizeHandle; coords: Point }[] = [
        { position: 'nw', coords: { x, y } },
        { position: 'ne', coords: { x: x + width, y } },
        { position: 'sw', coords: { x, y: y + height } },
        { position: 'se', coords: { x: x + width, y: y + height } },
        { position: 'n', coords: { x: x + width / 2, y } },
        { position: 's', coords: { x: x + width / 2, y: y + height } },
        { position: 'w', coords: { x, y: y + height / 2 } },
        { position: 'e', coords: { x: x + width, y: y + height / 2 } },
        { position: 'rotate', coords: { x: x + width / 2, y: y - 20 } },
    ];
    for (const handle of handlesDef) {
        const rotatedHandle = rotatePoint(handle.coords, center, angle);
        const bounds = {
            x1: rotatedHandle.x - halfHandleSize, y1: rotatedHandle.y - halfHandleSize,
            x2: rotatedHandle.x + halfHandleSize, y2: rotatedHandle.y + halfHandleSize,
        };
        if (point.x >= bounds.x1 && point.x <= bounds.x2 && point.y >= bounds.y1 && point.y <= bounds.y2) {
            return handle.position;
        }
    }
    return null;
}
export function getCursorForResizeHandle(handle: ResizeHandle): string {
    switch (handle) {
        case 'nw': case 'se': return 'nwse-resize';
        case 'ne': case 'sw': return 'nesw-resize';
        case 'n': case 's': return 'ns-resize';
        case 'w': case 'e': return 'ew-resize';
        case 'rotate': return 'grab';
        default: return 'default';
    }
}
const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return ''
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(`M ${x0} ${y0} Q ${x0} ${y0} ${x1} ${y1}`)
      return acc
    },
    [] as string[]
  )
  return d.join(' ')
}
export function getFreehandPath(element: PencilElement): string {
  return getSvgPathFromStroke(
    getStroke(element.points, {
      size: Number(element.strokeWidth) * 2,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })
  );
}
export function getBoundingBox(elements: DrawingElement[]): { x: number; y: number; width: number; height: number } | null {
  if (elements.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach(el => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
export function isElementInsideSelectionBox(element: DrawingElement, selectionBox: { x: number; y: number; width: number; height: number }): boolean {
  return (
    element.x >= selectionBox.x &&
    element.y >= selectionBox.y &&
    element.x + element.width <= selectionBox.x + selectionBox.width &&
    element.y + element.height <= selectionBox.y + selectionBox.height
  );
}