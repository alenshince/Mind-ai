import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';

const LOCAL_STORAGE_KEY = 'mind_ai_notes_cache';

export const notesService = {
  subscribeToUserNotes(userId, onUpdate, onError) {
    if (!isFirebaseConfigured || !db || !userId) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          onUpdate(JSON.parse(stored));
        } catch {
          onUpdate([]);
        }
      }
      return () => {};
    }

    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef, 
      where('userId', '==', userId), 
      orderBy('pinned', 'desc'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notes = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
          updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate().toISOString() : d.data().updatedAt,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
        onUpdate(notes);
      },
      (err) => {
        console.error('[Mind AI] Firestore subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  async addNote(userId, noteData) {
    const payload = {
      userId,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      type: noteData.type || 'note', // 'note' | 'code' | 'snippet' | 'research'
      language: noteData.language || 'markdown',
      tags: noteData.tags || [],
      pinned: Boolean(noteData.pinned),
      summary: noteData.summary || '',
      createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
    };

    if (!isFirebaseConfigured || !db) {
      const id = 'local-note-' + Date.now();
      const newNote = { ...payload, id };
      return newNote;
    }

    const docRef = await addDoc(collection(db, 'notes'), payload);
    return { id: docRef.id, ...payload };
  },

  async updateNote(noteId, updates) {
    if (!isFirebaseConfigured || !db) {
      return { id: noteId, ...updates, updatedAt: new Date().toISOString() };
    }
    const docRef = doc(db, 'notes', noteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  },

  async deleteNote(noteId) {
    if (!isFirebaseConfigured || !db) {
      return true;
    }
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
    return true;
  },

  async togglePin(noteId, currentPinned) {
    return this.updateNote(noteId, { pinned: !currentPinned });
  }
};
