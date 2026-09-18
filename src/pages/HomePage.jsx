import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { createCanvas, getRecentCanvases, deleteCanvasDoc } from '../firebase/canvasService';

export function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [recentCanvases, setRecentCanvases] = useState([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(true);

  useEffect(() => {
    async function loadRecents() {
      try {
        const list = await getRecentCanvases(12);
        setRecentCanvases(list);
      } catch (err) {
        console.warn('Error loading canvases:', err);
      } finally {
        setIsLoadingRecents(false);
      }
    }
    loadRecents();
  }, []);

  const handleCreateNewCanvas = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const idempotencyKey = 'create_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newCanvasId = await createCanvas('Untitled Canvas', idempotencyKey);
      if (newCanvasId) {
        navigate(`/canvas/${newCanvasId}`);
      }
    } catch (err) {
      console.error('Failed to create canvas:', err);
      setIsCreating(false);
    }
  };

  const handleDeleteCanvas = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteCanvasDoc(id);
      setRecentCanvases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete canvas:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 select-none flex flex-col">
      {/* Utility Top Bar */}
      <header className="h-12 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-900 tracking-tight">
          Canvases
        </span>

        <button
          onClick={handleCreateNewCanvas}
          disabled={isCreating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded transition-colors disabled:opacity-60"
        >
          {isCreating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>New canvas</span>
        </button>
      </header>

      {/* Main Launcher Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        {isLoadingRecents ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-40 bg-white border border-neutral-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentCanvases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentCanvases.map((canvas) => (
              <div
                key={canvas.id}
                onClick={() => navigate(`/canvas/${canvas.id}`)}
                className="group bg-white border border-neutral-200 hover:border-blue-500 rounded-lg overflow-hidden cursor-pointer transition-colors flex flex-col h-44 shadow-sm"
              >
                {/* Thumbnail Surface */}
                <div className="flex-1 bg-neutral-50 flex items-center justify-center border-b border-neutral-100 overflow-hidden relative">
                  {canvas.thumbnail ? (
                    <img
                      src={canvas.thumbnail}
                      alt={canvas.title}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-medium">Blank</span>
                  )}
                </div>

                {/* Card Meta */}
                <div className="p-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <h3 className="text-xs font-semibold text-neutral-800 truncate">
                      {canvas.title || 'Untitled Canvas'}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {canvas.updatedAt
                        ? typeof canvas.updatedAt === 'string'
                          ? new Date(canvas.updatedAt).toLocaleDateString()
                          : 'Recently edited'
                        : 'Recent'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteCanvas(e, canvas.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded transition-colors"
                    title="Delete canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-neutral-500 font-medium">
              No canvases yet.
            </p>
            <button
              onClick={handleCreateNewCanvas}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Click here to create your first canvas
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
