import { create } from 'zustand';
import type { IQuestion } from '../types';

// ============================
// Admin Store
// ============================

interface AdminState {
  generatedQuestion: IQuestion | null;

  // Actions
  setGeneratedQuestion: (question: IQuestion | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  generatedQuestion: null,

  setGeneratedQuestion: (question) => set({ generatedQuestion: question }),
}));
