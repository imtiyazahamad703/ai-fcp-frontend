import { create } from 'zustand';
import type { IEditorFile } from '../types';

// ============================
// Workspace Store
// ============================

interface WorkspaceState {
  files: IEditorFile[];
  activeFileIndex: number;
  isRunning: boolean;
  isSubmitting: boolean;
  output: string;

  // Actions
  setFiles: (files: IEditorFile[]) => void;
  setActiveFileIndex: (index: number) => void;
  updateFileContent: (index: number, content: string) => void;
  setIsRunning: (running: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setOutput: (output: string) => void;
  resetWorkspace: () => void;
}

const initialState = {
  files: [],
  activeFileIndex: 0,
  isRunning: false,
  isSubmitting: false,
  output: '',
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,

  setFiles: (files: IEditorFile[]) => {
    set({ files, activeFileIndex: 0 });
  },

  setActiveFileIndex: (index: number) => {
    set({ activeFileIndex: index });
  },

  updateFileContent: (index: number, content: string) => {
    set((state) => {
      const updatedFiles = [...state.files];
      if (updatedFiles[index]) {
        updatedFiles[index] = { ...updatedFiles[index], content };
      }
      return { files: updatedFiles };
    });
  },

  setIsRunning: (running: boolean) => {
    set({ isRunning: running });
  },

  setIsSubmitting: (submitting: boolean) => {
    set({ isSubmitting: submitting });
  },

  setOutput: (output: string) => {
    set({ output });
  },

  resetWorkspace: () => {
    set(initialState);
  },
}));
