import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DrawingElement, DrawStore, Tool, Action, Alignment, Point } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getBoundingBox } from '@/lib/utils';
const initialState = {
  tool: 'select' as Tool,
  elements: [] as DrawingElement[],
  selectedElementIds: [] as string[],
  action: 'none' as Action,
  resizeHandle: null,
  startPoint: null,
  currentPoint: null,
  elementWithResizeHandles: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 } as Point,
  isPanning: false,
  isShiftPressed: false,
  isAltPressed: false,
  past: [] as DrawingElement[][],
  present: [] as DrawingElement[],
  future: [] as DrawingElement[][],
};
export const useDrawStore = create<DrawStore>()(
  immer((set, get) => ({
    ...initialState,
    present: initialState.elements,
    setTool: (tool) => set({ tool, selectedElementIds: [] }),
    setElements: (updater) => {
      const currentElements = get().elements;
      const newElements = typeof updater === 'function' ? updater(currentElements) : updater;
      set({ elements: newElements });
    },
    setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
    setAction: (action) => set({ action }),
    setResizeHandle: (handle) => set({ resizeHandle: handle }),
    setStartPoint: (point) => set({ startPoint: point }),
    setCurrentPoint: (point) => set({ currentPoint: point }),
    setElementWithResizeHandles: (element) => set({ elementWithResizeHandles: element }),
    updateElement: (id, updater) => {
      set((state) => {
        const element = state.elements.find((el) => el.id === id);
        if (element) {
          updater(element);
        }
      });
    },
    updateSelectedElementsProperties: (properties) => {
      set((state) => {
        state.selectedElementIds.forEach((id) => {
          const element = state.elements.find((el) => el.id === id);
          if (element) {
            Object.assign(element, properties);
          }
        });
      });
    },
    setZoom: (zoom) => {
      set((state) => {
        state.zoom = typeof zoom === 'function' ? zoom(state.zoom) : zoom;
      });
    },
    setPanOffset: (offset) => {
      set((state) => {
        state.panOffset = typeof offset === 'function' ? offset(state.panOffset) : offset;
      });
    },
    setIsPanning: (isPanning) => {
      set({ isPanning });
    },
    setIsShiftPressed: (isShiftPressed) => {
      set({ isShiftPressed });
    },
    setIsAltPressed: (isAltPressed) => {
      set({ isAltPressed });
    },
    bringForward: (id) => {
      set((state) => {
        const index = state.elements.findIndex((el) => el.id === id);
        if (index > -1 && index < state.elements.length - 1) {
          const [element] = state.elements.splice(index, 1);
          state.elements.push(element);
        }
      });
      get().takeSnapshot();
    },
    sendBackward: (id) => {
      set((state) => {
        const index = state.elements.findIndex((el) => el.id === id);
        if (index > 0) {
          const [element] = state.elements.splice(index, 1);
          state.elements.unshift(element);
        }
      });
      get().takeSnapshot();
    },
    deleteSelectedElements: () => {
      set((state) => {
        state.elements = state.elements.filter(el => !state.selectedElementIds.includes(el.id));
        state.selectedElementIds = [];
      });
      get().takeSnapshot();
    },
    duplicateSelectedElements: () => {
      set((state) => {
        const newElements: DrawingElement[] = [];
        state.selectedElementIds.forEach(id => {
          const element = state.elements.find(el => el.id === id);
          if (element) {
            const newElement = { ...element, id: uuidv4(), x: element.x + 10, y: element.y + 10, seed: Math.random() * 10000 };
            newElements.push(newElement);
          }
        });
        state.elements.push(...newElements);
        state.selectedElementIds = newElements.map(el => el.id);
      });
      get().takeSnapshot();
    },
    alignElements: (alignment) => {
      const { elements, selectedElementIds } = get();
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      const boundingBox = getBoundingBox(selectedElements);
      if (!boundingBox) return;
      const { x, y, width, height } = boundingBox;
      set((state) => {
        state.elements.forEach(el => {
          if (state.selectedElementIds.includes(el.id)) {
            switch (alignment) {
              case 'left': el.x = x; break;
              case 'right': el.x = x + width - el.width; break;
              case 'center-horizontal': el.x = x + (width - el.width) / 2; break;
              case 'top': el.y = y; break;
              case 'bottom': el.y = y + height - el.height; break;
              case 'center-vertical': el.y = y + (height - el.height) / 2; break;
            }
          }
        });
      });
      get().takeSnapshot();
    },
    takeSnapshot: () => {
      set((state) => {
        if (state.past.length > 50) {
          state.past.shift();
        }
        state.past.push(state.present);
        state.present = state.elements;
        state.future = [];
      });
    },
    undo: () => {
      set((state) => {
        if (state.past.length > 0) {
          state.future.unshift(state.present);
          const newPresent = state.past.pop()!;
          state.present = newPresent;
          state.elements = newPresent;
          state.selectedElementIds = [];
        }
      });
    },
    redo: () => {
      set((state) => {
        if (state.future.length > 0) {
          state.past.push(state.present);
          const newPresent = state.future.shift()!;
          state.present = newPresent;
          state.elements = newPresent;
          state.selectedElementIds = [];
        }
      });
    },
  }))
);