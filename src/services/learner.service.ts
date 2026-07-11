import { api } from './axios';
import type { IQuestion } from '../types';

export const learnerService = {
  /**
   * Get all published questions.
   */
  getPublishedQuestions: async (): Promise<IQuestion[]> => {
    const response = await api.get<{ questions: IQuestion[] }>('/questions');
    return response.data.questions;
  },

  /**
   * Get a specific question by ID.
   */
  getQuestionById: async (id: string): Promise<IQuestion> => {
    const response = await api.get<{ question: IQuestion }>(`/questions/${id}`);
    return response.data.question;
  },

  /**
   * Get user profile and stats
   */
  getProfile: async (): Promise<{ id: string; name: string; completedQuestions: string[] }> => {
    const response = await api.get<{ profile: { id: string; name: string; completedQuestions: string[] } }>('/users/profile');
    return response.data.profile;
  },

  /**
   * Submit code for execution.
   */
  submitExecution: async (
    questionId: string,
    files: { filename: string; content: string }[]
  ): Promise<{ message: string; status: 'pass' | 'fail'; output: string }> => {
    const response = await api.post<{ message: string; status: 'pass' | 'fail'; output: string }>('/execution/submit', {
      questionId,
      files,
    });
    return response.data;
  },
};
