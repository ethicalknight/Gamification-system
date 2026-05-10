import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface CyberLab {
  id: string;
  platform: 'HackTheBox' | 'TryHackMe' | 'PortSwigger' | 'Other';
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  completedAt: string;
  notes?: string;
}

interface CyberState {
  labs: CyberLab[];
  logLab: (lab: Omit<CyberLab, 'id' | 'completedAt'>) => void;
  deleteLab: (id: string) => void;
}

export const useCyberStore = create<CyberState>()(
  persist(
    (set) => ({
      labs: [],
      logLab: (lab) => {
        set((state) => ({
          labs: [
            ...state.labs,
            { ...lab, id: Date.now().toString(36) + Math.random().toString(36).substr(2), completedAt: new Date().toISOString() }
          ]
        }));
        
        let xpReward = 50;
        if (lab.difficulty === 'Medium') xpReward = 100;
        if (lab.difficulty === 'Hard') xpReward = 250;
        if (lab.difficulty === 'Insane') xpReward = 500;
        
        useGamificationStore.getState().awardXP(xpReward, `Completed Cyber Lab: ${lab.name}`);
      },
      deleteLab: (id) => set((state) => ({
        labs: state.labs.filter(l => l.id !== id)
      })),
    }),
    {
      name: 'system-cyber-storage',
    }
  )
);
