import { api } from './axios';

export interface INote {
  _id?: string;
  userId?: string;
  questionId: any; // populated object or id
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const notesService = {
  /**
   * Get all notes for the logged in user
   */
  getMyNotes: async (): Promise<INote[]> => {
    const response = await api.get<INote[]>('/notes');
    return response.data;
  },

  /**
   * Get note content for a specific question.
   * If it doesn't exist, returns { content: '' }.
   */
  getNoteByQuestion: async (questionId: string): Promise<INote> => {
    const response = await api.get<INote>(`/notes/${questionId}`);
    return response.data;
  },

  /**
   * Save (create or update) note content for a specific question.
   */
  saveNote: async (questionId: string, content: string): Promise<INote> => {
    const response = await api.post<INote>(`/notes/${questionId}`, { content });
    return response.data;
  },
};
