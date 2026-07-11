import { api } from './axios';
import type { IQuestion } from '../types';

// ============================
// Admin API Service
// ============================

export const adminService = {
  /**
   * Use AI to generate a question based on a topic.
   */
  generateQuestion: async (
    topic: string,
    type: 'react' | 'nestjs' | 'fullstack',
  ): Promise<IQuestion> => {
    const response = await api.post<{ question: IQuestion }>(
      '/admin/questions/generate',
      { topic, type },
    );
    return response.data.question;
  },

  /**
   * Save a reviewed question to the database.
   */
  saveQuestion: async (
    question: Partial<IQuestion>,
  ): Promise<IQuestion> => {
    const response = await api.post<{ question: IQuestion }>(
      '/admin/questions',
      question,
    );
    return response.data.question;
  },
};
