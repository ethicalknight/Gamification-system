import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export interface WorkoutPlan {
  id: string;
  name: string;
  type: 'Home' | 'Gym' | 'PPL' | 'Strength';
  exercises: { name: string; sets: number; reps: string }[];
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  time: string;
}

export interface FitnessLog {
  id: string;
  date: string;
  weight: number;
  waterIntakeLiters: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  workoutCompleted: boolean;
}

interface ExerciseState {
  // Profile
  heightCm: number;
  currentWeight: number;
  goalWeight: number;
  
  // Logs
  fitnessLogs: FitnessLog[];
  meals: Meal[];
  
  // Actions
  updateProfile: (weight: number, goal: number) => void;
  logDailyStats: (log: Omit<FitnessLog, 'id' | 'date'>) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  removeMeal: (id: string) => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set) => ({
      heightCm: 183, // 6ft
      currentWeight: 53, // 53kg
      goalWeight: 65, // Weight gain goal
      fitnessLogs: [],
      meals: [
        { id: 'm1', name: 'Oats & Banana & Milk', calories: 450, protein: 15, time: 'Breakfast' },
        { id: 'm2', name: 'Dal, Rice & Paneer', calories: 600, protein: 25, time: 'Lunch' },
        { id: 'm3', name: 'Peanut Butter Sandwich & Soya Chunks', calories: 500, protein: 30, time: 'Snack' },
        { id: 'm4', name: 'Chana & Sprouts Salad', calories: 300, protein: 15, time: 'Dinner' }
      ],
      updateProfile: (currentWeight, goalWeight) => set({ currentWeight, goalWeight }),
      logDailyStats: (log) => {
        set((state) => ({
          fitnessLogs: [
            ...state.fitnessLogs,
            { ...log, id: Date.now().toString(36) + Math.random().toString(36).substr(2), date: new Date().toISOString() }
          ]
        }));
        useGamificationStore.getState().awardXP(50, 'Logged Daily Fitness Stats');
        if (log.workoutCompleted) {
          useGamificationStore.getState().awardXP(100, 'Workout Completed!');
        }
      },
      addMeal: (meal) => set((state) => ({
        meals: [...state.meals, { ...meal, id: Date.now().toString(36) + Math.random().toString(36).substr(2) }]
      })),
      removeMeal: (id) => set((state) => ({
        meals: state.meals.filter(m => m.id !== id)
      }))
    }),
    {
      name: 'system-advanced-exercise-storage',
    }
  )
);
