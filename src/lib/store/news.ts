import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  savedAt: string;
}

interface NewsState {
  savedArticles: Article[];
  saveArticle: (a: Omit<Article, 'id' | 'savedAt'>) => void;
  removeArticle: (id: string) => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set) => ({
      savedArticles: [],
      saveArticle: (a) => {
        set((state) => ({
          savedArticles: [
            ...state.savedArticles,
            { ...a, id: Date.now().toString(36) + Math.random().toString(36).substr(2), savedAt: new Date().toISOString() }
          ]
        }));
        useGamificationStore.getState().awardXP(5, 'News Article Saved');
      },
      removeArticle: (id) => set((state) => ({
        savedArticles: state.savedArticles.filter(a => a.id !== id)
      })),
    }),
    {
      name: 'system-news-storage',
    }
  )
);
