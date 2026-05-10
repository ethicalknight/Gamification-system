import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  stack: string;
  completionPercentage: number;
  githubUrl?: string;
  deploymentUrl?: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'completionPercentage'>) => void;
  updateProgress: (id: string, percentage: number) => void;
  updateStatus: (id: string, status: ProjectStatus) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (p) => {
        set((state) => ({
          projects: [
            ...state.projects,
            { ...p, id: Date.now().toString(36) + Math.random().toString(36).substr(2), createdAt: new Date().toISOString(), completionPercentage: 0 }
          ]
        }));
        useGamificationStore.getState().awardXP(50, 'New Project Initiated');
      },
      updateProgress: (id, percentage) => {
        set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, completionPercentage: percentage } : p)
        }));
        if (percentage === 100) {
          useGamificationStore.getState().awardXP(200, 'Project Completed');
        } else {
          useGamificationStore.getState().awardXP(10, 'Project Progressed');
        }
      },
      updateStatus: (id, status) => {
        set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, status } : p)
        }));
        if (status === 'completed') useGamificationStore.getState().awardXP(200, 'Project Completed');
        if (status === 'abandoned') useGamificationStore.getState().applyPenalty(50, 'Project Abandoned');
      },
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'system-projects-storage',
    }
  )
);
