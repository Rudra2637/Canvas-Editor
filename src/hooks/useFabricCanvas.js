import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';

/**
 * Custom hook to manage the Fabric.js 2D Canvas lifecycle, tools, and history
 * 
 * @param {object} options
 * @param {Function} options.onCanvasChange - Callback fired on any canvas modification (for auto-save)
 */
export function useFabricCanvas({ onCanvasChange } = {}) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const onCanvasChangeRef = useRef(onCanvasChange);
  useEffect(() => {
    onCanvasChangeRef.current = onCanvasChange;
  }, [onCanvasChange]);

  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'rect' | 'circle' | 'text' | 'pen'
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectRevision, setObjectRevision] = useState(0); // Reactive trigger for property updates
  const [brushColor, setBrushColor] = useState('#111827');
  const [brushWidth, setBrushWidth] = useState(3);
  const [fillColor, setFillColor] = useState('#2563eb');
  const [strokeColor, setStrokeColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(0);

  // Undo / Redo history
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isInternalUpdateRef = useRef(false);
  const pendingDataRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistoryState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isInternalUpdateRef.current) return;

    try {
      const json = JSON.stringify(canvas.toJSON());
      const nextIndex = historyIndexRef.current + 1;
      historyRef.current = historyRef.current.slice(0, nextIndex);
      historyRef.current.push(json);
      historyIndexRef.current = nextIndex;

      if (historyRef.current.length > 30) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }

      updateHistoryFlags();
    } catch (err) {
      console.warn('Could not serialize history snapshot:', err);
    }
  }, [updateHistoryFlags]);

  const loadCanvasData = useCallback(async (jsonString) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      pendingDataRef.current = jsonString;
      return;
    }
    if (!jsonString) return;

    try {
      isInternalUpdateRef.current = true;
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      await canvas.loadFromJSON(parsed);
      canvas.requestRenderAll();

      historyRef.current = [JSON.stringify(canvas.toJSON())];
      historyIndexRef.current = 0;
      updateHistoryFlags();
    } catch (error) {
      console.error('Failed to load canvas data:', error);
    } finally {
      isInternalUpdateRef.current = false;
    }
  }, [updateHistoryFlags]);

  const undo = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;

    isInternalUpdateRef.current = true;
    historyIndexRef.current--;
    const previousState = historyRef.current[historyIndexRef.current];

    try {
      await canvas.loadFromJSON(JSON.parse(previousState));
      canvas.requestRenderAll();
      setSelectedObject(canvas.getActiveObject() || null);
      if (onCanvasChangeRef.current) onCanvasChangeRef.current();
    } catch (err) {
      console.error('Error during undo:', err);
    } finally {
      isInternalUpdateRef.current = false;
      updateHistoryFlags();
    }
  }, [updateHistoryFlags]);

  const redo = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;

    isInternalUpdateRef.current = true;
    historyIndexRef.current++;
    const nextState = historyRef.current[historyIndexRef.current];

    try {
      await canvas.loadFromJSON(JSON.parse(nextState));
      canvas.requestRenderAll();
      setSelectedObject(canvas.getActiveObject() || null);
      if (onCanvasChangeRef.current) onCanvasChangeRef.current();
    } catch (err) {
      console.error('Error during redo:', err);
    } finally {
      isInternalUpdateRef.current = false;
      updateHistoryFlags();
    }
  }, [updateHistoryFlags]);

  // Mount Fabric Canvas with clean neutral board
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvasEl = canvasRef.current;
    const parentContainer = canvasEl.parentElement;
    const initialWidth = parentContainer ? parentContainer.clientWidth : 1200;
    const initialHeight = parentContainer ? parentContainer.clientHeight : 800;

    const canvas = new fabric.Canvas(canvasEl, {
      width: initialWidth,
      height: initialHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      selectionColor: 'rgba(37, 99, 235, 0.08)',
      selectionBorderColor: '#2563eb',
      selectionLineWidth: 1
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    const syncSelection = () => {
      const activeObj = canvas.getActiveObject();
      setSelectedObject(activeObj || null);
      setObjectRevision((r) => r + 1);
    };

    const notifyMutation = () => {
      if (!isInternalUpdateRef.current) {
        pushHistoryState();
        if (onCanvasChangeRef.current) {
          onCanvasChangeRef.current();
        }
      }
    };

    canvas.on('selection:created', syncSelection);
    canvas.on('selection:updated', syncSelection);
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setObjectRevision((r) => r + 1);
    });

    canvas.on('object:modified', () => {
      syncSelection();
      notifyMutation();
    });

    canvas.on('object:added', () => {
      if (!isInternalUpdateRef.current) {
        notifyMutation();
      }
    });

    canvas.on('object:removed', () => {
      if (!isInternalUpdateRef.current) {
        notifyMutation();
      }
    });

    canvas.on('path:created', notifyMutation);

    if (pendingDataRef.current) {
      loadCanvasData(pendingDataRef.current);
      pendingDataRef.current = null;
    } else {
      pushHistoryState();
    }

    const handleResize = () => {
      if (!parentContainer || !fabricCanvasRef.current) return;
      fabricCanvasRef.current.setDimensions({
        width: parentContainer.clientWidth,
        height: parentContainer.clientHeight
      });
      fabricCanvasRef.current.requestRenderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
      setIsReady(false);
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'pen') {
      canvas.isDrawingMode = true;
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.selection = false;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      setSelectedObject(null);
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    }
  }, [activeTool, brushColor, brushWidth]);

  const configureControlHandles = (obj) => {
    obj.set({
      cornerColor: '#ffffff',
      cornerStrokeColor: '#2563eb',
      borderColor: '#2563eb',
      cornerSize: 8,
      cornerStyle: 'rect',
      transparentCorners: false
    });
  };

  const addRectangle = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    setActiveTool('select');

    const center = canvas.getCenterPoint();
    const rect = new fabric.Rect({
      left: Math.max(20, center.x - 70),
      top: Math.max(20, center.y - 50),
      fill: fillColor || '#2563eb',
      stroke: strokeWidth > 0 ? strokeColor : null,
      strokeWidth: strokeWidth || 0,
      width: 140,
      height: 100,
      selectable: true,
      evented: true
    });

    configureControlHandles(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setSelectedObject(rect);
    setObjectRevision((r) => r + 1);
    canvas.requestRenderAll();
  }, [fillColor, strokeColor, strokeWidth]);

  const addCircle = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    setActiveTool('select');

    const center = canvas.getCenterPoint();
    const circle = new fabric.Circle({
      left: Math.max(20, center.x - 55),
      top: Math.max(20, center.y - 55),
      fill: fillColor || '#dc2626',
      stroke: strokeWidth > 0 ? strokeColor : null,
      strokeWidth: strokeWidth || 0,
      radius: 55,
      selectable: true,
      evented: true
    });

    configureControlHandles(circle);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    setSelectedObject(circle);
    setObjectRevision((r) => r + 1);
    canvas.requestRenderAll();
  }, [fillColor, strokeColor, strokeWidth]);

  const addText = useCallback((initialText = 'Type text here') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    setActiveTool('select');

    const center = canvas.getCenterPoint();
    const text = new fabric.IText(initialText, {
      left: Math.max(20, center.x - 70),
      top: Math.max(20, center.y - 15),
      fill: '#111827',
      fontSize: 22,
      fontFamily: 'Inter, sans-serif',
      selectable: true,
      evented: true,
      editable: true
    });

    configureControlHandles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    setSelectedObject(text);
    setObjectRevision((r) => r + 1);
    canvas.requestRenderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.discardActiveGroup ? canvas.discardActiveGroup() : canvas.discardActiveObject();
    canvas.requestRenderAll();
    setSelectedObject(null);
    setObjectRevision((r) => r + 1);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.requestRenderAll();
    setSelectedObject(null);
    setObjectRevision((r) => r + 1);
    pushHistoryState();
    if (onCanvasChangeRef.current) onCanvasChangeRef.current();
  }, [pushHistoryState]);

  // Robust, real-time object mutation handler
  const updateSelectedObject = useCallback((property, value) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;

    // Handle special cases
    if (property === 'strokeWidth' && value > 0 && !selectedObject.stroke) {
      selectedObject.set('stroke', strokeColor || '#111827');
    }

    if (property === 'fontSize' && selectedObject.isType && selectedObject.isType('i-text', 'text', 'textbox')) {
      // If object had scaling, normalize it so fontSize reflects exact pt size
      selectedObject.set({
        fontSize: value,
        scaleX: 1,
        scaleY: 1
      });
    } else {
      selectedObject.set(property, value);
    }

    selectedObject.setCoords();
    canvas.requestRenderAll();
    setObjectRevision((r) => r + 1);

    pushHistoryState();
    if (onCanvasChangeRef.current) onCanvasChangeRef.current();
  }, [selectedObject, strokeColor, pushHistoryState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        (selectedObject && selectedObject.isEditing)
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'r' || e.key === 'R') {
        addRectangle();
      } else if (e.key === 'c' || e.key === 'C') {
        addCircle();
      } else if (e.key === 't' || e.key === 'T') {
        addText();
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('pen');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, undo, redo, addRectangle, addCircle, addText, deleteSelected]);

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    isReady,
    activeTool,
    setActiveTool,
    selectedObject,
    objectRevision,
    brushColor,
    setBrushColor,
    brushWidth,
    setBrushWidth,
    fillColor,
    setFillColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    canUndo,
    canRedo,
    undo,
    redo,
    addRectangle,
    addCircle,
    addText,
    deleteSelected,
    clearCanvas,
    updateSelectedObject,
    loadCanvasData
  };
}
