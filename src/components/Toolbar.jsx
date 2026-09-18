import React, { useState } from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Type,
  PenTool,
  Trash2,
  RotateCcw,
  Undo2,
  Redo2,
  X
} from 'lucide-react';

export function Toolbar({
  activeTool,
  setActiveTool,
  onAddRectangle,
  onAddCircle,
  onAddText,
  selectedObject,
  onDeleteSelected,
  onClearCanvas,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) {
  const [showPenOptions, setShowPenOptions] = useState(false);

  const handlePenClick = () => {
    if (activeTool === 'pen') {
      setShowPenOptions((prev) => !prev);
    } else {
      setActiveTool('pen');
      setShowPenOptions(true);
    }
  };

  const primaryTools = [
    {
      id: 'select',
      label: 'Select (V)',
      icon: MousePointer,
      onClick: () => {
        setActiveTool('select');
        setShowPenOptions(false);
      },
      isActive: activeTool === 'select'
    },
    {
      id: 'rect',
      label: 'Rectangle (R)',
      icon: Square,
      onClick: () => {
        onAddRectangle();
        setShowPenOptions(false);
      },
      isActive: false
    },
    {
      id: 'circle',
      label: 'Circle (C)',
      icon: Circle,
      onClick: () => {
        onAddCircle();
        setShowPenOptions(false);
      },
      isActive: false
    },
    {
      id: 'text',
      label: 'Text (T)',
      icon: Type,
      onClick: () => {
        onAddText();
        setShowPenOptions(false);
      },
      isActive: false
    },
    {
      id: 'pen',
      label: 'Pen (P)',
      icon: PenTool,
      onClick: handlePenClick,
      isActive: activeTool === 'pen'
    }
  ];

  const presetColors = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 select-none">
      {/* Pen Options Popover (Opens cleanly directly above the dock) */}
      {activeTool === 'pen' && showPenOptions && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3 flex flex-col gap-2.5 w-48 mb-1">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
            <span className="text-[11px] font-semibold text-neutral-700">Pen Settings</span>
            <button
              onClick={() => setShowPenOptions(false)}
              className="p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Stroke Width Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium text-neutral-500">
              <span>Thickness</span>
              <span className="font-mono text-neutral-800">{brushWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1 bg-neutral-200 rounded"
            />
          </div>

          {/* Color Presets */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  brushColor === color ? 'scale-125 border-white ring-2 ring-blue-600 shadow-sm' : 'border-neutral-300 hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-4 h-4 rounded overflow-hidden cursor-pointer border-0 bg-transparent p-0"
              title="Custom Color"
            />
          </div>
        </div>
      )}

      {/* Main Floating Tool Dock */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-lg p-1 flex items-center gap-1 text-neutral-700">
        {/* Primary Creation & Mode Tools */}
        <div className="flex items-center gap-0.5">
          {primaryTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.onClick}
                className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                  tool.isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* History Actions: Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo
                ? 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo
                ? 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* Delete Object Action */}
        <button
          onClick={onDeleteSelected}
          disabled={!selectedObject}
          className={`p-2 rounded-lg transition-colors ${
            selectedObject
              ? 'text-red-600 hover:bg-red-50'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
          title="Delete selected (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          title="Clear canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
