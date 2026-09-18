import { useState, useEffect, useRef, useCallback } from 'react';
import { saveCanvas } from '../firebase/canvasService';

/**
 * Hook to manage automatic and manual saving of canvas state to Firestore
 * 
 * @param {string} canvasId - The current canvas ID
 * @param {object} fabricCanvas - Fabric canvas instance
 * @param {string} title - Canvas title
 * @param {number} debounceMs - Delay in ms before auto-saving (default: 1500ms)
 */
export function useAutoSave(canvasId, fabricCanvas, title, debounceMs = 1500) {
  // Save status states: 'saved' | 'saving' | 'unsaved' | 'error'
  const [saveStatus, setSaveStatus] = useState('saved');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Perform the actual save operation
  const performSave = useCallback(async () => {
    if (!canvasId || !fabricCanvas) return;

    if (isMountedRef.current) {
      setSaveStatus('saving');
    }

    try {
      // Serialize fabric canvas to JSON
      const canvasJson = JSON.stringify(fabricCanvas.toJSON());

      // Create a small preview thumbnail (data URL)
      let thumbnail = null;
      try {
        thumbnail = fabricCanvas.toDataURL({
          format: 'png',
          multiplier: 0.2, // Small lightweight preview
          quality: 0.7
        });
      } catch (err) {
        console.warn('Could not generate thumbnail:', err);
      }

      const success = await saveCanvas(canvasId, {
        canvasData: canvasJson,
        title: title || 'Untitled Canvas',
        thumbnail
      });

      if (isMountedRef.current) {
        if (success) {
          setSaveStatus('saved');
          setLastSavedTime(new Date());
        } else {
          setSaveStatus('error');
        }
      }
    } catch (error) {
      console.error('Error during save:', error);
      if (isMountedRef.current) {
        setSaveStatus('error');
      }
    }
  }, [canvasId, fabricCanvas, title]);

  // Request an auto-save (debounced)
  const scheduleAutoSave = useCallback(() => {
    if (!autoSaveEnabled) {
      setSaveStatus('unsaved');
      return;
    }

    setSaveStatus('unsaved');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [autoSaveEnabled, debounceMs, performSave]);

  // Manual save trigger (immediate, cancels pending debounce)
  const manualSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    return performSave();
  }, [performSave]);

  // Cleanup on unmount & prompt if unsaved
  useEffect(() => {
    isMountedRef.current = true;

    const handleBeforeUnload = (e) => {
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  return {
    saveStatus,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSavedTime,
    scheduleAutoSave,
    manualSave
  };
}
