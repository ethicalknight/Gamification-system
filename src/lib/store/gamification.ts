import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Finance' | 'Learning';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: TaskCategory;
  deadline: string;
  done: boolean;
  createdAt: string;
}

interface GamificationState {
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  rank: Rank;
  stats: {
    intelligence: number;
    discipline: number;
    strength: number;
    consistency: number;
    focus: number;
    knowledge: number;
    finance: number;
    networking: number;
    coding: number;
    cybersecurity: number;
  };
  streakDays: number;
  badges: Badge[];
  tasks: Task[];
  updateProfile: (username: string, avatarUrl: string) => void;
  awardXP: (amount: number, reason: string) => void;
  applyPenalty: (amount: number, reason: string) => void;
  checkLevelUp: () => void;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'done' | 'createdAt'>) => void;
  deleteTask: (id: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      username: 'Arjun',
      avatarUrl: '',
      level: 1,
      xp: 0,
      rank: 'E',
      stats: {
        intelligence: 10,
        discipline: 10,
        strength: 10,
        consistency: 10,
        focus: 10,
        knowledge: 10,
        finance: 10,
        networking: 10,
        coding: 10,
        cybersecurity: 10,
      },
      streakDays: 0,
      badges: [],
      tasks: [],
      updateProfile: (username, avatarUrl) => set({ username, avatarUrl }),
      awardXP: (amount, reason) => {
        set((state) => ({ xp: state.xp + amount }));
        get().checkLevelUp();
      },
      applyPenalty: (amount, reason) => set((state) => ({ xp: Math.max(0, state.xp - amount) })),
      addTask: (t) => {
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...t, id: Date.now().toString(36) + Math.random().toString(36).substr(2), done: false, createdAt: new Date().toISOString() }
          ]
        }));
      },
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),
      toggleTask: (id) => {
        const state = get();
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;
        
        const newDone = !task.done;
        set({
          tasks: state.tasks.map(t => t.id === id ? { ...t, done: newDone } : t)
        });

        // XP based on Priority
        let xpReward = 10;
        if (task.priority === 'Medium') xpReward = 25;
        if (task.priority === 'High') xpReward = 50;
        if (task.priority === 'Critical') xpReward = 100;

        if (newDone) {
          get().awardXP(xpReward, `Completed Task: ${task.title}`);
        } else {
          get().applyPenalty(xpReward, `Reverted Task: ${task.title}`);
        }
      },
      checkLevelUp: () => {
        const state = get();
        const xpForNextLevel = state.level * 1000;
        if (state.xp >= xpForNextLevel) {
          const newLevel = state.level + 1;
          const newBadges = [...state.badges];
          
          // Add badge logic
          if (newLevel % 5 === 0) {
            newBadges.push({
              id: `lvl-${newLevel}`,
              name: `Level ${newLevel} Achieved`,
              icon: '🏆',
              unlockedAt: new Date().toISOString()
            });
          }

          // Rank logic
          let newRank = state.rank;
          if (newLevel >= 50) newRank = 'SS';
          else if (newLevel >= 40) newRank = 'S';
          else if (newLevel >= 30) newRank = 'A';
          else if (newLevel >= 20) newRank = 'B';
          else if (newLevel >= 10) newRank = 'C';
          else if (newLevel >= 5) newRank = 'D';

          set({ level: newLevel, rank: newRank, badges: newBadges, xp: state.xp - xpForNextLevel });
        }
      }
    }),
    {
      name: 'system-gamification-storage',
    }
  )
);
