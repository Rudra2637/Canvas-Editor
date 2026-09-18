import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { LocalStorageAdapter } from './localStorageAdapter';

const COLLECTION_NAME = 'canvases';
const NETWORK_TIMEOUT_MS = 2500;

function withTimeout(promise, timeoutMs = NETWORK_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase network timeout')), timeoutMs)
    )
  ]);
}

const activeCreationTokens = new Map();

// ==========================================
// Firestore Cloud Adapter
// ==========================================
const FirestoreAdapter = {
  async create(title = 'Untitled Canvas', customId = null) {
    // Generate standard Firestore Document ID instantly on the client
    const canvasCol = collection(db, COLLECTION_NAME);
    const newDocRef = customId ? doc(canvasCol, customId) : doc(canvasCol);
    const docId = newDocRef.id;

    const initialData = {
      id: docId,
      title,
      canvasData: null,
      thumbnail: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to local mirror immediately so user never waits
    LocalStorageAdapter.save(docId, initialData);

    // Save to Firestore in cloud
    try {
      withTimeout(setDoc(newDocRef, initialData)).catch((err) => {
        console.warn('Firestore initial doc sync in background:', err.message);
      });
    } catch (err) {
      console.warn('Firestore write init failed:', err.message);
    }

    return docId;
  },

  async get(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await withTimeout(getDoc(docRef));

      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        LocalStorageAdapter.save(id, data);
        return data;
      }
      return LocalStorageAdapter.get(id);
    } catch (err) {
      console.warn('Firestore get timed out or waiting on rules, reading local cache:', err.message);
      return LocalStorageAdapter.get(id);
    }
  },

  async save(id, payload) {
    // Save to local cache first
    LocalStorageAdapter.save(id, payload);

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withTimeout(setDoc(docRef, {
        ...payload,
        updatedAt: serverTimestamp()
      }, { merge: true }));

      return true;
    } catch (err) {
      console.warn('Firestore save timed out, saved locally:', err.message);
      return true;
    }
  },

  async list(limitCount = 10) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await withTimeout(getDocs(q));
      const canvases = [];
      snapshot.forEach(docSnap => {
        canvases.push({ id: docSnap.id, ...docSnap.data() });
      });

      return canvases.length > 0 ? canvases : LocalStorageAdapter.list(limitCount);
    } catch (err) {
      console.warn('Firestore query timed out, reading local list:', err.message);
      return LocalStorageAdapter.list(limitCount);
    }
  },

  async delete(id) {
    LocalStorageAdapter.delete(id);
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await withTimeout(deleteDoc(docRef));
    } catch (err) {
      console.warn('Firestore delete failed or timed out:', err.message);
    }
    return true;
  }
};

const activeAdapter = isFirebaseConfigured && db ? FirestoreAdapter : LocalStorageAdapter;

// ==========================================
// Service API with Creation Idempotency
// ==========================================

export async function createCanvas(title = 'Untitled Canvas', idempotencyKey = null) {
  if (idempotencyKey && activeCreationTokens.has(idempotencyKey)) {
    return activeCreationTokens.get(idempotencyKey);
  }

  const creationPromise = (async () => {
    try {
      return await activeAdapter.create(title);
    } finally {
      if (idempotencyKey) {
        setTimeout(() => activeCreationTokens.delete(idempotencyKey), 5000);
      }
    }
  })();

  if (idempotencyKey) {
    activeCreationTokens.set(idempotencyKey, creationPromise);
  }

  return creationPromise;
}

export async function getCanvas(canvasId) {
  if (!canvasId) return null;
  return activeAdapter.get(canvasId);
}

export async function saveCanvas(canvasId, payload) {
  if (!canvasId) return false;
  return activeAdapter.save(canvasId, payload);
}

export async function getRecentCanvases(limitCount = 10) {
  return activeAdapter.list(limitCount);
}

export async function deleteCanvasDoc(canvasId) {
  if (!canvasId) return false;
  return activeAdapter.delete(canvasId);
}
