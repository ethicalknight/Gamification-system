import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Deadline {
  id: string;
  title: string;
  date: string; // ISO
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  recurring: boolean;
  notified: boolean;
  createdAt: string;
}

interface DeadlineState {
  deadlines: Deadline[];
  addDeadline: (d: Omit<Deadline, 'id' | 'notified' | 'createdAt'>) => void;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  deleteDeadline: (id: string) => void;
  markNotified: (id: string) => void;
}

export const useDeadlineStore = create<DeadlineState>()(
  persist(
    (set) => ({
      deadlines: [],
      addDeadline: (d) => set((state) => ({
        deadlines: [
          ...state.deadlines,
          { ...d, id: Date.now().toString(36) + Math.random().toString(36).substr(2), notified: false, createdAt: new Date().toISOString() }
        ]
      })),
      updateDeadline: (id, updates) => set((state) => ({
        deadlines: state.deadlines.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      deleteDeadline: (id) => set((state) => ({
        deadlines: state.deadlines.filter(d => d.id !== id)
      })),
      markNotified: (id) => set((state) => ({
        deadlines: state.deadlines.map(d => d.id === id ? { ...d, notified: true } : d)
      })),
    }),
    { name: 'system-deadlines-storage' }
  )
);
