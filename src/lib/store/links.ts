import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  isBookmarked: boolean;
  usefulScore: number; // 1-5
  createdAt: string;
}

interface LinkState {
  links: LinkItem[];
  addLink: (link: Omit<LinkItem, 'id' | 'createdAt'>) => void;
  updateLink: (id: string, updates: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  toggleBookmark: (id: string) => void;
}

export const useLinkStore = create<LinkState>()(
  persist(
    (set) => ({
      links: [],
      addLink: (link) => {
        set((state) => ({
          links: [
            ...state.links,
            { ...link, id: Date.now().toString(36) + Math.random().toString(36).substr(2), createdAt: new Date().toISOString() }
          ]
        }));
        useGamificationStore.getState().awardXP(5, 'Saved new resource link');
      },
      updateLink: (id, updates) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      deleteLink: (id) => set((state) => ({
        links: state.links.filter(l => l.id !== id)
      })),
      toggleBookmark: (id) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, isBookmarked: !l.isBookmarked } : l)
      })),
    }),
    { name: 'system-links-storage-v2' }
  )
);
