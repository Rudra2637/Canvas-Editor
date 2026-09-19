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
export function useAutoSave(canvasId, fabricCanvas, title, debounceMs = 1200) {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const titleRef = useRef(title);
  const canvasRef = useRef(fabricCanvas);
  const canvasIdRef = useRef(canvasId);

  // Keep references always fresh
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    canvasRef.current = fabricCanvas;
  }, [fabricCanvas]);

  useEffect(() => {
    canvasIdRef.current = canvasId;
  }, [canvasId]);

  // Execute the save operation
  const performSave = useCallback(async (customTitle = null) => {
    const id = canvasIdRef.current;
    const canvas = canvasRef.current;
    if (!id || !canvas) return false;

    const currentTitle = customTitle || titleRef.current || 'Untitled Canvas';

    if (isMountedRef.current) {
      setSaveStatus('saving');
    }

    try {
      const canvasJson = JSON.stringify(canvas.toJSON());

      let thumbnail = null;
      try {
        thumbnail = canvas.toDataURL({
          format: 'png',
          multiplier: 0.2,
          quality: 0.7
        });
      } catch (err) {
        console.warn('Thumbnail generation skipped:', err);
      }

      const success = await saveCanvas(id, {
        canvasData: canvasJson,
        title: currentTitle,
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
      return success;
    } catch (error) {
      console.error('Error during save:', error);
      if (isMountedRef.current) {
        setSaveStatus('error');
      }
      return false;
    }
  }, []);

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
      debounceTimerRef.current = null;
      performSave();
    }, debounceMs);
  }, [autoSaveEnabled, debounceMs, performSave]);

  // Immediate save trigger (e.g. title rename or manual save click)
  const manualSave = useCallback((overrideTitle = null) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    return performSave(overrideTitle);
  }, [performSave]);

  // Flush any pending unsaved changes when unmounting
  useEffect(() => {
    isMountedRef.current = true;

    const handleBeforeUnload = (e) => {
      if (debounceTimerRef.current || saveStatus === 'unsaved') {
        performSave();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMountedRef.current = false;
      // If an auto-save timer is pending when navigating away, save immediately!
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        performSave();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performSave, saveStatus]);

  return {
    saveStatus,
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastSavedTime,
    scheduleAutoSave,
    manualSave
  };
}
