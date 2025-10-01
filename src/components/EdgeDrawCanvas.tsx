import React, { useRef, useEffect, useState } from 'react';
import rough from 'roughjs';
import { useDrawStore } from '@/store/useDrawStore';
import { DrawingElement, ResizeHandle, RoughGenerator, Tool, Point, ArrowElement } from '@/lib/types';
import { createElement, getElementAtPosition, getResizeHandleAtPosition, getCursorForResizeHandle, getFreehandPath, getBoundingBox, isElementInsideSelectionBox } from '@/lib/utils';
export function EdgeDrawCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [roughGenerator, setRoughGenerator] = useState<RoughGenerator | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  // State selectors
  const tool = useDrawStore((state) => state.tool);
  const elements = useDrawStore((state) => state.elements);
  const action = useDrawStore((state) => state.action);
  const selectedElementIds = useDrawStore((state) => state.selectedElementIds);
  const startPoint = useDrawStore((state) => state.startPoint);
  const zoom = useDrawStore((state) => state.zoom);
  const panOffset = useDrawStore((state) => state.panOffset);
  const isPanning = useDrawStore((state) => state.isPanning);
  const isShiftPressed = useDrawStore((state) => state.isShiftPressed);
  const isAltPressed = useDrawStore((state) => state.isAltPressed);
  const resizeHandle = useDrawStore((state) => state.resizeHandle);
  // Action selectors
  const setElements = useDrawStore((state) => state.setElements);
  const setAction = useDrawStore((state) => state.setAction);
  const setSelectedElementIds = useDrawStore((state) => state.setSelectedElementIds);
  const setStartPoint = useDrawStore((state) => state.setStartPoint);
  const updateElement = useDrawStore((state) => state.updateElement);
  const takeSnapshot = useDrawStore((state) => state.takeSnapshot);
  const setResizeHandle = useDrawStore((state) => state.setResizeHandle);
  const setPanOffset = useDrawStore((state) => state.setPanOffset);
  const setIsPanning = useDrawStore((state) => state.setIsPanning);
  const setIsShiftPressed = useDrawStore((state) => state.setIsShiftPressed);
  const setIsAltPressed = useDrawStore((state) => state.setIsAltPressed);
  useEffect(() => {
    if (svgRef.current) setRoughGenerator(rough.svg(svgRef.current));
  }, []);
  useEffect(() => {
    if (action === "writing" && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [action]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsPanning(true);
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Alt') setIsAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsPanning(false);
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.key === 'Alt') setIsAltPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsPanning, setIsShiftPressed, setIsAltPressed]);
  useEffect(() => {
    if (svgRef.current) {
      if (isPanning) {
        svgRef.current.style.cursor = action === 'panning' ? 'grabbing' : 'grab';
      } else {
        svgRef.current.style.cursor = 'default';
      }
    }
  }, [isPanning, action]);
  const getMouseCoordinates = (event: React.MouseEvent<SVGSVGElement> | MouseEvent): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - panOffset.x) / zoom,
      y: (event.clientY - rect.top - panOffset.y) / zoom,
    };
  };
  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (action === 'writing') return;
    const { x, y } = getMouseCoordinates(event);
    setStartPoint({ x, y });
    if (isPanning || event.button === 1) {
      setAction('panning');
      return;
    }
    if (tool === 'select') {
      const clickedElement = getElementAtPosition(x, y, elements);
      if (clickedElement) {
        const handle = getResizeHandleAtPosition({ x, y }, clickedElement);
        if (handle) {
          setAction(handle === 'rotate' ? 'rotating' : 'resizing');
          setResizeHandle(handle);
        } else {
          setAction('moving');
        }
        if (event.shiftKey) {
          setSelectedElementIds(
            selectedElementIds.includes(clickedElement.id)
              ? selectedElementIds.filter(id => id !== clickedElement.id)
              : [...selectedElementIds, clickedElement.id]
          );
        } else {
          if (!selectedElementIds.includes(clickedElement.id)) {
            setSelectedElementIds([clickedElement.id]);
          }
        }
      } else {
        setAction('selecting');
        setSelectedElementIds([]);
      }
    } else {
      const newElement = createElement({ x, y, type: tool as Exclude<Tool, 'select'>, properties: { stroke: '#000000', fill: 'transparent', fillStyle: 'hachure', strokeWidth: 2, roughness: 1 } });
      setElements((prev) => [...prev, newElement]);
      setSelectedElementIds([newElement.id]);
      setAction(tool === 'text' ? 'writing' : 'drawing');
    }
  };
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!action || action === 'none' || !startPoint) return;
    const { x, y } = getMouseCoordinates(event);
    const dx = x - startPoint.x;
    const dy = y - startPoint.y;
    if (action === 'panning') {
      setPanOffset(prev => ({ x: prev.x + event.movementX, y: prev.y + event.movementY }));
      return;
    }
    if (action === 'selecting') {
      const width = x - startPoint.x;
      const height = y - startPoint.y;
      setSelectionBox({ x: width > 0 ? startPoint.x : x, y: height > 0 ? startPoint.y : y, width: Math.abs(width), height: Math.abs(height) });
      return;
    }
    const selectedId = selectedElementIds[0];
    if (!selectedId && action !== 'moving') return;
    if (action === 'drawing') {
      const selectedElement = elements.find(el => el.id === selectedId);
      if (!selectedElement) return;
      updateElement(selectedId, (el) => {
        if (el.type === 'pencil') {
          el.points.push({ x, y });
        } else if (el.type === 'line' || el.type === 'arrow') {
          el.width = Math.abs(dx);
          el.height = Math.abs(dy);
          el.points = [{ x: 0, y: 0 }, { x: dx, y: dy }];
        } else {
          // Refactored drawing logic for rectangle and ellipse
          let x1 = startPoint.x;
          let y1 = startPoint.y;
          let x2 = x;
          let y2 = y;
          if (isAltPressed) {
            x1 = startPoint.x - dx;
            y1 = startPoint.y - dy;
            x2 = startPoint.x + dx;
            y2 = startPoint.y + dy;
          }
          if (isShiftPressed) {
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            const size = Math.max(width, height);
            x2 = x1 + size * Math.sign(x2 - x1);
            y2 = y1 + size * Math.sign(y2 - y1);
          }
          el.x = Math.min(x1, x2);
          el.y = Math.min(y1, y2);
          el.width = Math.abs(x1 - x2);
          el.height = Math.abs(y1 - y2);
        }
      });
    } else if (action === 'moving') {
      setElements(elements => elements.map(el => selectedElementIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el));
      setStartPoint({ x, y });
    } else if (action === 'resizing' && resizeHandle) {
      if (selectedElementIds.length > 1) return;
      updateElement(selectedId, (el) => {
        if (el.type === 'line' || el.type === 'arrow' || el.type === 'pencil' || el.type === 'text') return;
        switch (resizeHandle) {
          case 'nw': el.x += dx; el.y += dy; el.width -= dx; el.height -= dy; break;
          case 'ne': el.y += dy; el.width += dx; el.height -= dy; break;
          case 'sw': el.x += dx; el.width -= dx; el.height += dy; break;
          case 'se': el.width += dx; el.height += dy; break;
          case 'n': el.y += dy; el.height -= dy; break;
          case 's': el.height += dy; break;
          case 'w': el.x += dx; el.width -= dx; break;
          case 'e': el.width += dx; break;
        }
        if (el.width < 0) { el.x += el.width; el.width *= -1; }
        if (el.height < 0) { el.y += el.height; el.height *= -1; }
      });
      setStartPoint({ x, y });
    } else if (action === 'rotating') {
      if (selectedElementIds.length > 1) return;
      const selectedElement = elements.find(el => el.id === selectedId);
      if (!selectedElement) return;
      const center = { x: selectedElement.x + selectedElement.width / 2, y: selectedElement.y + selectedElement.height / 2 };
      const angle = Math.atan2(y - center.y, x - center.x) * (180 / Math.PI) + 90;
      updateElement(selectedId, (el) => { el.angle = angle; });
    }
  };
  const handleMouseUp = () => {
    if (action === 'selecting' && selectionBox) {
      const selectedIds = elements.filter(el => isElementInsideSelectionBox(el, selectionBox)).map(el => el.id);
      setSelectedElementIds(selectedIds);
    }
    if (action === 'moving' && selectedElementIds.length > 1) {
      takeSnapshot();
    }
    setSelectionBox(null);
    if (action === 'writing') return;
    if (action !== 'none' && action !== 'selecting' && action !== 'panning' && !(action === 'moving' && selectedElementIds.length > 1)) takeSnapshot();
    setAction('none');
    setStartPoint(null);
    setResizeHandle(null);
  };
  const handleDoubleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getMouseCoordinates(event);
    const clickedElement = getElementAtPosition(x, y, elements);
    if (clickedElement && clickedElement.type === 'text') {
      setAction('writing');
      setSelectedElementIds([clickedElement.id]);
    }
  };
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const selectedId = selectedElementIds[0];
    if (!selectedId) return;
    updateElement(selectedId, (el) => { if (el.type === 'text') el.text = e.target.value; });
  };
  const handleTextBlur = () => {
    takeSnapshot();
    setAction('none');
    setSelectedElementIds([]);
  };
  const renderElement = (element: DrawingElement) => {
    if (!roughGenerator) return null;
    const { type, x, y, width, height, angle, seed } = element;
    const transform = `translate(${x} ${y}) rotate(${angle} ${width / 2} ${height / 2})`;
    if (type === 'pencil') {
      return <path key={element.id} d={getFreehandPath(element)} stroke={element.stroke} strokeWidth={element.strokeWidth} fill="none" transform={`translate(${x} ${y}) rotate(${angle})`} />;
    }
    if (type === 'text') {
      return <text key={element.id} x={0} y={element.fontSize} fontFamily={element.fontFamily} fontSize={element.fontSize} fill={element.stroke} transform={transform}>{element.text}</text>;
    }
    const options: any = { stroke: element.stroke, strokeWidth: element.strokeWidth, seed };
    if ('fill' in element) options.fill = element.fill;
    if ('fillStyle' in element) options.fillStyle = element.fillStyle;
    if ('roughness' in element) options.roughness = element.roughness;
    if (type === 'line' || type === 'arrow') {
      if (element.strokeStyle === 'dashed') options.strokeLineDash = [10, 10];
      if (element.strokeStyle === 'dotted') options.strokeLineDash = [2, 8];
    }
    let shape;
    if (type === 'rectangle') shape = roughGenerator.rectangle(0, 0, width, height, options);
    else if (type === 'ellipse') shape = roughGenerator.ellipse(width / 2, height / 2, width, height, options);
    else if (type === 'line' || type === 'arrow') {
      shape = roughGenerator.line(element.points[0].x, element.points[0].y, element.points[1].x, element.points[1].y, { ...options, roughness: 0 });
      if (type === 'arrow' && shape) {
        const { x: x2, y: y2 } = element.points[1];
        const angle = Math.atan2(y2 - element.points[0].y, x2 - element.points[0].x);
        const arrowLength = 15;
        const arrowWidth = 10;
        let arrowHeadPath;
        if (element.arrowhead === 'triangle') {
          const x3 = x2 - arrowLength * Math.cos(angle - Math.PI / 6);
          const y3 = y2 - arrowLength * Math.sin(angle - Math.PI / 6);
          const x4 = x2 - arrowLength * Math.cos(angle + Math.PI / 6);
          const y4 = y2 - arrowLength * Math.sin(angle + Math.PI / 6);
          arrowHeadPath = `M ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
        } else if (element.arrowhead === 'bar') {
          const x3 = x2 - arrowWidth * Math.cos(angle - Math.PI / 2);
          const y3 = y2 - arrowWidth * Math.sin(angle - Math.PI / 2);
          const x4 = x2 - arrowWidth * Math.cos(angle + Math.PI / 2);
          const y4 = y2 - arrowWidth * Math.sin(angle + Math.PI / 2);
          arrowHeadPath = `M ${x3} ${y3} L ${x4} ${y4}`;
        } else { // default 'arrow'
          const x3 = x2 - arrowLength * Math.cos(angle - Math.PI / 6);
          const y3 = y2 - arrowLength * Math.sin(angle - Math.PI / 6);
          const x4 = x2 - arrowLength * Math.cos(angle + Math.PI / 6);
          const y4 = y2 - arrowLength * Math.sin(angle + Math.PI / 6);
          arrowHeadPath = `M ${x3} ${y3} L ${x2} ${y2} L ${x4} ${y4}`;
        }
        return (
          <g key={element.id} transform={transform}>
            <path d={shape.getAttribute('d') || ''} fill="none" stroke={element.stroke} strokeWidth={element.strokeWidth} strokeDasharray={options.strokeLineDash?.join(' ')} />
            <path d={arrowHeadPath} fill={element.arrowhead === 'triangle' ? element.stroke : 'none'} stroke={element.stroke} strokeWidth={element.strokeWidth} />
          </g>
        );
      }
    }
    if (!shape) return null;
    return <g key={element.id} transform={transform}><path d={shape.getAttribute('d') || ''} fill={shape.getAttribute('fill') || 'none'} stroke={shape.getAttribute('stroke') || 'none'} strokeWidth={shape.getAttribute('stroke-width') || '0'} strokeDasharray={options.strokeLineDash?.join(' ')} /></g>;
  };
  const renderSelectionBox = () => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return null;
    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      if (element.type === 'pencil') return null;
      const { x, y, width, height, angle } = element;
      const transform = `rotate(${angle} ${x + width / 2} ${y + height / 2})`;
      if (element.type === 'text') {
        return <g key={`${element.id}-selection`} transform={transform}><rect x={x} y={y} width={width} height={height} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" strokeDasharray="3 3" /></g>;
      }
      const handleSize = 8;
      const halfHandleSize = handleSize / 2;
      const handles: { position: ResizeHandle; x: number; y: number }[] = [
        { position: 'nw', x: x - halfHandleSize, y: y - halfHandleSize }, { position: 'ne', x: x + width - halfHandleSize, y: y - halfHandleSize },
        { position: 'sw', x: x - halfHandleSize, y: y + height - halfHandleSize }, { position: 'se', x: x + width - halfHandleSize, y: y + height - halfHandleSize },
        { position: 'n', x: x + width / 2 - halfHandleSize, y: y - halfHandleSize }, { position: 's', x: x + width / 2 - halfHandleSize, y: y + height - halfHandleSize },
        { position: 'w', x: x - halfHandleSize, y: y + height / 2 - halfHandleSize }, { position: 'e', x: x + width - halfHandleSize, y: y + height / 2 - halfHandleSize },
      ];
      const rotationHandle = { x: x + width / 2 - halfHandleSize, y: y - 20 - halfHandleSize };
      return (
        <g key={`${element.id}-selection`} transform={transform}>
          <rect x={x} y={y} width={width} height={height} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" strokeDasharray="3 3" style={{ transformOrigin: `${x + width / 2}px ${y + height / 2}px` }} />
          {handles.map(h => <rect key={h.position} x={h.x} y={h.y} width={handleSize} height={handleSize} fill="white" stroke="rgb(59, 130, 246)" strokeWidth="1" style={{ cursor: getCursorForResizeHandle(h.position) }} />)}
          <g>
            <rect x={rotationHandle.x} y={rotationHandle.y} width={handleSize} height={handleSize} fill="white" stroke="rgb(59, 130, 246)" strokeWidth="1" style={{ cursor: getCursorForResizeHandle('rotate') }} />
            <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y - 20} stroke="rgb(59, 130, 246)" strokeWidth="1" />
          </g>
        </g>
      );
    } else {
      const box = getBoundingBox(selectedElements);
      if (!box) return null;
      return <rect key="multi-selection" x={box.x} y={box.y} width={box.width} height={box.height} fill="rgba(59, 130, 246, 0.1)" stroke="rgb(59, 130, 246)" strokeWidth="1" strokeDasharray="3 3" />;
    }
  };
  const writingElement = action === 'writing' ? elements.find(el => el.id === selectedElementIds[0]) : null;
  return (
    <>
      {writingElement && writingElement.type === 'text' && (
        <textarea ref={textAreaRef} value={writingElement.text} onChange={handleTextChange} onBlur={handleTextBlur} style={{ position: 'fixed', top: (writingElement.y * zoom + panOffset.y) + (svgRef.current?.getBoundingClientRect().top || 0), left: (writingElement.x * zoom + panOffset.x) + (svgRef.current?.getBoundingClientRect().left || 0), fontSize: writingElement.fontSize * zoom, fontFamily: writingElement.fontFamily, border: '1px solid #3b82f6', margin: 0, padding: 0, background: 'transparent', outline: 'none', resize: 'none', overflow: 'hidden', whiteSpace: 'pre', color: writingElement.stroke, zIndex: 100, transform: `rotate(${writingElement.angle}deg)`, transformOrigin: 'top left' }} />
      )}
      <svg ref={svgRef} className="w-full h-full" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onDoubleClick={handleDoubleClick}>
        <g style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`, transformOrigin: 'top left' }}>
          {elements.map(renderElement)}
          {renderSelectionBox()}
          {selectionBox && <rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(59, 130, 246, 0.2)" stroke="rgb(59, 130, 246)" strokeWidth="1" />}
        </g>
      </svg>
    </>
  );
}