import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CanvasEditorPage } from './pages/CanvasEditorPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing / Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* 2D Canvas Editor Page */}
        <Route path="/canvas/:canvasId" element={<CanvasEditorPage />} />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
