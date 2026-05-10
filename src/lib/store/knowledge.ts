import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

interface KnowledgeState {
  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (n) => {
        set((state) => ({
          notes: [
            ...state.notes,
            { ...n, id: Date.now().toString(36) + Math.random().toString(36).substr(2), createdAt: new Date().toISOString() }
          ]
        }));
        useGamificationStore.getState().awardXP(15, 'Knowledge Base Expanded');
      },
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),
    }),
    {
      name: 'system-knowledge-storage',
    }
  )
);
