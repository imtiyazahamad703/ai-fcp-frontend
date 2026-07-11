import { create } from 'zustand';
import type { IQuestion } from '../types';

// ============================
// Admin Store
// ============================

interface AdminState {
  generatedQuestion: IQuestion | null;
  questions: IQuestion[];
  selectedQuestion: IQuestion | null;

  // Actions
  setGeneratedQuestion: (question: IQuestion | null) => void;
  setQuestions: (questions: IQuestion[]) => void;
  setSelectedQuestion: (question: IQuestion | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  generatedQuestion: null,
  questions: [],
  selectedQuestion: null,

  setGeneratedQuestion: (question) => set({ generatedQuestion: question }),
  setQuestions: (questions) => set({ questions }),
  setSelectedQuestion: (question) => set({ selectedQuestion: question }),
}));
