const LOCAL_STORAGE_PREFIX = 'canvas_app_doc_';
const LOCAL_STORAGE_INDEX = 'canvas_app_recent_index';

/**
 * Clean Local Storage fallback adapter implementing the standard storage interface
 */
export const LocalStorageAdapter = {
  async create(title = 'Untitled Canvas', customId = null) {
    const id = customId || ('local_' + Math.random().toString(36).substring(2, 10));
    const canvasDoc = {
      id,
      title,
      canvasData: null,
      thumbnail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_PREFIX + id, JSON.stringify(canvasDoc));

    const index = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INDEX) || '[]');
    if (!index.includes(id)) {
      index.unshift(id);
      localStorage.setItem(LOCAL_STORAGE_INDEX, JSON.stringify(index.slice(0, 30)));
    }

    return id;
  },

  async get(id) {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  },

  async save(id, payload) {
    const existing = (await this.get(id)) || { id, createdAt: new Date().toISOString() };
    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_PREFIX + id, JSON.stringify(updated));
    return true;
  },

  async list(limitCount = 10) {
    const index = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INDEX) || '[]');
    return index
      .map(id => {
        const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + id);
        return raw ? JSON.parse(raw) : null;
      })
      .filter(Boolean)
      .slice(0, limitCount);
  },

  async delete(id) {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + id);
    const index = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INDEX) || '[]');
    localStorage.setItem(
      LOCAL_STORAGE_INDEX,
      JSON.stringify(index.filter(item => item !== id))
    );
    return true;
  }
};
