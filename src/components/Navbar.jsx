import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Share2,
  Save,
  Loader2,
  Edit2
} from 'lucide-react';

export function Navbar({
  title,
  onTitleChange,
  saveStatus,
  onManualSave
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title || 'Untitled Canvas');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== title) {
      onTitleChange(tempTitle.trim());
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.warn('Failed to copy share link:', err);
    }
  };

  return (
    <header className="h-11 bg-white border-b border-neutral-200 px-3.5 flex items-center justify-between z-30 select-none text-neutral-900">
      {/* Left: Launcher Back Link & Document Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Back to all canvases"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Canvases</span>
        </Link>

        <div className="h-3.5 w-px bg-neutral-200" />

        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit}>
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="bg-neutral-100 text-neutral-900 text-xs font-semibold px-2 py-0.5 rounded outline-none ring-1 ring-blue-600 border border-neutral-300 w-48"
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors"
            title="Rename canvas"
          >
            <span className="max-w-[220px] truncate">{title || 'Untitled Canvas'}</span>
            <Edit2 className="w-3 h-3 text-neutral-400 opacity-60" />
          </button>
        )}
      </div>

      {/* Right: Save Status & Actions */}
      <div className="flex items-center gap-2">
        {/* Functional Save Status Badge */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 px-2 py-0.5">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-neutral-600">Saved</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-neutral-600">Unsaved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-red-600">Save failed</span>
            </>
          )}
        </div>

        <div className="h-3.5 w-px bg-neutral-200 mx-1" />

        {/* Share Link Button */}
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
            copiedLink
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-700'
          }`}
          title="Copy link to clipboard"
        >
          {copiedLink ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Link copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </>
          )}
        </button>

        {/* Manual Save Button */}
        <button
          onClick={onManualSave}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded transition-colors shadow-sm"
          title="Save canvas"
        >
          <Save className="w-3 h-3" />
          <span>Save</span>
        </button>
      </div>
    </header>
  );
}
