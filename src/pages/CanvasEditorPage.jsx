import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getCanvas } from '../firebase/canvasService';
import { useFabricCanvas } from '../hooks/useFabricCanvas';
import { useAutoSave } from '../hooks/useAutoSave';
import { Navbar } from '../components/Navbar';
import { Toolbar } from '../components/Toolbar';
import { PropertiesPanel } from '../components/PropertiesPanel';

export function CanvasEditorPage() {
  const { canvasId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Untitled Canvas');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const {
    canvasRef,
    fabricCanvas,
    activeTool,
    setActiveTool,
    selectedObject,
    brushColor,
    setBrushColor,
    brushWidth,
    setBrushWidth,
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
  } = useFabricCanvas({
    onCanvasChange: () => {
      scheduleAutoSave();
    }
  });

  const {
    saveStatus,
    autoSaveEnabled,
    setAutoSaveEnabled,
    scheduleAutoSave,
    manualSave
  } = useAutoSave(canvasId, fabricCanvas, title);

  useEffect(() => {
    let isMounted = true;

    async function fetchCanvasData() {
      if (!canvasId) return;
      setIsLoading(true);
      setLoadError(null);

      try {
        const docData = await getCanvas(canvasId);
        if (!isMounted) return;

        if (docData) {
          if (docData.title) {
            setTitle(docData.title);
          }
          if (docData.canvasData) {
            await loadCanvasData(docData.canvasData);
          }
        }
      } catch (err) {
        console.warn('Could not load canvas data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCanvasData();

    return () => {
      isMounted = false;
    };
  }, [canvasId, loadCanvasData]);

  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    manualSave(newTitle); // Immediately persist title rename
  }, [manualSave]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 text-center select-none text-neutral-900">
        <h2 className="text-base font-semibold mb-1">Canvas not found</h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-4">
          This canvas may have been deleted or the URL is incorrect.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to canvases</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-100 overflow-hidden select-none">
      {/* Thin 44px Header with Auto-Save Toggle & Manual Save */}
      <Navbar
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={() => setAutoSaveEnabled((prev) => !prev)}
        onManualSave={() => manualSave(title)}
      />

      {/* Hero Canvas Area */}
      <div className="flex-1 flex relative overflow-hidden bg-neutral-100">
        {/* Center Canvas Viewport */}
        <div className="flex-1 h-full w-full relative flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-neutral-100/75 backdrop-blur-xs z-30 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-medium text-neutral-600">Loading canvas...</span>
            </div>
          )}
          <canvas ref={canvasRef} className="block w-full h-full shadow-xs" />
        </div>

        {/* Floating Contextual Properties Panel (Rendered ONLY when an object is selected) */}
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdateProperty={updateSelectedObject}
        />

        {/* Bottom-Center Tactile Tool Dock */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAddRectangle={addRectangle}
          onAddCircle={addCircle}
          onAddText={addText}
          selectedObject={selectedObject}
          onDeleteSelected={deleteSelected}
          onClearCanvas={clearCanvas}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushWidth={brushWidth}
          setBrushWidth={setBrushWidth}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
    </div>
  );
}
