import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGamificationStore } from './gamification'

export type JobStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  role: string;
  stage: JobStage;
  appliedDate: string;
  url?: string;
  notes?: string;
}

interface JobState {
  jobs: Job[];
  addJob: (j: Omit<Job, 'id' | 'appliedDate'>) => void;
  updateStage: (id: string, stage: JobStage) => void;
  deleteJob: (id: string) => void;
}

export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobs: [],
      addJob: (j) => {
        set((state) => ({
          jobs: [
            ...state.jobs,
            { ...j, id: Date.now().toString(36) + Math.random().toString(36).substr(2), appliedDate: new Date().toISOString() }
          ]
        }));
        useGamificationStore.getState().awardXP(25, 'Job Application Submitted');
      },
      updateStage: (id, stage) => {
        set((state) => ({
          jobs: state.jobs.map(j => j.id === id ? { ...j, stage } : j)
        }));
        if (stage === 'interview') useGamificationStore.getState().awardXP(100, 'Interview Secured!');
        if (stage === 'offer') useGamificationStore.getState().awardXP(500, 'Job Offer Received!');
      },
      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter(j => j.id !== id)
      })),
    }),
    {
      name: 'system-jobs-storage',
    }
  )
);
