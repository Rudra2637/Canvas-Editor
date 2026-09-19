import React, { useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Circle,
  Type,
  PenTool
} from 'lucide-react';

const PRESET_COLORS = [
  '#111827', // Black / Near-black
  '#ffffff', // White
  '#2563eb', // Blue (Accent)
  '#dc2626', // Red
  '#16a34a', // Green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#6b7280'  // Grey
];

export function PropertiesPanel({ selectedObject, onUpdateProperty }) {
  if (!selectedObject) {
    return null;
  }

  const objType = selectedObject.type;
  const isText = objType === 'i-text' || objType === 'text' || objType === 'textbox';
  const isPath = objType === 'path';

  // Internal reactive states for buttery-smooth slider dragging
  const [fill, setFill] = useState(selectedObject.fill || '#2563eb');
  const [stroke, setStroke] = useState(selectedObject.stroke || '#111827');
  const [strokeWidth, setStrokeWidth] = useState(
    typeof selectedObject.strokeWidth === 'number' ? selectedObject.strokeWidth : 0
  );
  const [opacity, setOpacity] = useState(
    Math.round((selectedObject.opacity ?? 1) * 100)
  );
  const [fontSize, setFontSize] = useState(selectedObject.fontSize || 22);
  const [fontWeight, setFontWeight] = useState(selectedObject.fontWeight || 'normal');
  const [fontStyle, setFontStyle] = useState(selectedObject.fontStyle || 'normal');
  const [textAlign, setTextAlign] = useState(selectedObject.textAlign || 'left');

  // Sync state whenever the active selected object reference changes
  useEffect(() => {
    if (selectedObject) {
      setFill(selectedObject.fill || '#2563eb');
      setStroke(selectedObject.stroke || '#111827');
      setStrokeWidth(typeof selectedObject.strokeWidth === 'number' ? selectedObject.strokeWidth : 0);
      setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
      setFontSize(selectedObject.fontSize || 22);
      setFontWeight(selectedObject.fontWeight || 'normal');
      setFontStyle(selectedObject.fontStyle || 'normal');
      setTextAlign(selectedObject.textAlign || 'left');
    }
  }, [selectedObject]);

  const handleFillChange = (val) => {
    setFill(val);
    onUpdateProperty('fill', val);
  };

  const handleStrokeChange = (val) => {
    setStroke(val);
    onUpdateProperty('stroke', val);
  };

  const handleStrokeWidthChange = (val) => {
    const num = Number(val);
    setStrokeWidth(num);
    onUpdateProperty('strokeWidth', num);
  };

  const handleOpacityChange = (val) => {
    const num = Number(val);
    setOpacity(num);
    onUpdateProperty('opacity', num / 100);
  };

  const handleFontSizeChange = (val) => {
    const num = Number(val);
    setFontSize(num);
    onUpdateProperty('fontSize', num);
  };

  const toggleBold = () => {
    const next = fontWeight === 'bold' ? 'normal' : 'bold';
    setFontWeight(next);
    onUpdateProperty('fontWeight', next);
  };

  const toggleItalic = () => {
    const next = fontStyle === 'italic' ? 'normal' : 'italic';
    setFontStyle(next);
    onUpdateProperty('fontStyle', next);
  };

  const handleAlignChange = (align) => {
    setTextAlign(align);
    onUpdateProperty('textAlign', align);
  };

  return (
    <aside className="absolute top-4 right-4 z-20 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg p-3.5 flex flex-col gap-3 text-neutral-800 select-none">
      {/* Object Type Tag Header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-100 text-xs font-semibold text-neutral-700">
        {objType === 'rect' && <Square className="w-3.5 h-3.5 text-blue-600" />}
        {objType === 'circle' && <Circle className="w-3.5 h-3.5 text-blue-600" />}
        {isText && <Type className="w-3.5 h-3.5 text-blue-600" />}
        {isPath && <PenTool className="w-3.5 h-3.5 text-blue-600" />}
        <span className="capitalize">{isText ? 'Text' : isPath ? 'Drawing' : objType} Properties</span>
      </div>

      {/* 1. Fill Color (Shapes & Text) */}
      {!isPath && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600">
            <span>Fill Color</span>
            <span className="font-mono text-[10px] text-neutral-400 uppercase">{fill}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleFillChange(color)}
                className={`w-5 h-5 rounded-md border transition-transform ${
                  fill === color
                    ? 'scale-110 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                    : 'border-neutral-200 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={fill.startsWith('#') ? fill : '#2563eb'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="w-5 h-5 rounded overflow-hidden cursor-pointer border-0 bg-transparent p-0"
              title="Custom Color"
            />
          </div>
        </div>
      )}

      {/* 2. Stroke / Border */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600">
          <span>{isPath ? 'Stroke Color' : 'Border Color'}</span>
          <span className="font-mono text-[10px] text-neutral-400 uppercase">{stroke}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleStrokeChange(color)}
              className={`w-5 h-5 rounded-md border transition-transform ${
                stroke === color
                  ? 'scale-110 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                  : 'border-neutral-200 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={stroke.startsWith('#') ? stroke : '#111827'}
            onChange={(e) => handleStrokeChange(e.target.value)}
            className="w-5 h-5 rounded overflow-hidden cursor-pointer border-0 bg-transparent p-0"
            title="Custom Color"
          />
        </div>

        {/* Border Thickness Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
            <span>Border Thickness</span>
            <span className="font-mono text-neutral-700">{strokeWidth}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="1"
            value={strokeWidth}
            onChange={(e) => handleStrokeWidthChange(e.target.value)}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-neutral-200 rounded"
          />
        </div>
      </div>

      {/* 3. Typography (for Text) */}
      {isText && (
        <div className="space-y-2 pt-1 border-t border-neutral-100">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium text-neutral-500">
              <span>Font Size</span>
              <span className="font-mono text-neutral-700">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="96"
              step="1"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-neutral-200 rounded"
            />
          </div>

          {/* Bold, Italic & Align Toggles */}
          <div className="flex items-center gap-1 pt-0.5">
            <button
              type="button"
              onClick={toggleBold}
              className={`p-1.5 rounded border text-xs font-bold transition-colors ${
                fontWeight === 'bold'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleItalic}
              className={`p-1.5 rounded border text-xs transition-colors ${
                fontStyle === 'italic'
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-px bg-neutral-200 mx-1" />

            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleAlignChange(align)}
                className={`p-1.5 rounded border text-xs transition-colors ${
                  textAlign === align
                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
                title={`Align ${align}`}
              >
                {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Opacity Slider */}
      <div className="space-y-1 pt-1 border-t border-neutral-100">
        <div className="flex justify-between text-[10px] font-medium text-neutral-500">
          <span>Opacity</span>
          <span className="font-mono text-neutral-700">{opacity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="1"
          value={opacity}
          onChange={(e) => handleOpacityChange(e.target.value)}
          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-neutral-200 rounded"
        />
      </div>
    </aside>
  );
}
