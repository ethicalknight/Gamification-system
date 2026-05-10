import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'subscription' | 'investment';
  category: string;
  description: string;
  isNecessary: boolean;
  date: string; // ISO string - user-selectable
  createdAt: string;
}

interface FinanceState {
  transactions: Transaction[];
  monthlyTarget: number;
  setMonthlyTarget: (amount: number) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      monthlyTarget: 5000,
      setMonthlyTarget: (amount) => set({ monthlyTarget: amount }),
      addTransaction: (tx) => {
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...tx, id: Date.now().toString(36) + Math.random().toString(36).substr(2), createdAt: new Date().toISOString() }
          ]
        }));
        const gamification = useGamificationStore.getState();
        if (tx.type === 'investment' || tx.type === 'income') {
          gamification.awardXP(20, 'Positive financial action');
        } else if (tx.type === 'expense' && !tx.isNecessary) {
          gamification.applyPenalty(10, 'Unnecessary expense');
        }
      },
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
    }),
    { name: 'system-finance-storage-v2' }
  )
);
