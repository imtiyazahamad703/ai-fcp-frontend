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
   * Submit code for execution.
   */
  submitExecution: async (
    questionId: string,
    files: { filename: string; content: string }[]
  ): Promise<{ message: string; status: 'pass' | 'fail'; output: string }> => {
    const response = await api.post('/execution/submit', {
      questionId,
      files,
    });
    return response.data;
  },
};
