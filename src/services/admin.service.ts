import { api } from './axios';
import type { IQuestion, IUser, IRegisterRequest } from '../types';

// ============================
// Admin API Service
// ============================

export const adminService = {
  /**
   * Get all admins for the dashboard.
   */
  getAdmins: async (): Promise<IUser[]> => {
    const response = await api.get<{ admins: IUser[] }>('/admin/users');
    return response.data.admins;
  },

  /**
   * Create a new admin.
   */
  createAdmin: async (data: IRegisterRequest): Promise<IUser> => {
    const response = await api.post<{ admin: IUser }>('/admin/users', data);
    return response.data.admin;
  },

  /**
   * Delete an admin.
   */
  deleteAdmin: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  /**
   * Use AI to generate a question based on a topic.
   */
  generateQuestion: async (
    userPrompt: string,
    type: 'react' | 'fullstack',
  ): Promise<IQuestion> => {
    const response = await api.post<{ question: IQuestion }>(
      '/admin/questions/generate',
      { userPrompt, type },
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

  /**
   * Get all questions for the admin list.
   */
  getQuestions: async (): Promise<IQuestion[]> => {
    const response = await api.get<{ questions: IQuestion[] }>('/admin/questions');
    return response.data.questions;
  },

  /**
   * Get a specific question by ID.
   */
  getQuestionById: async (id: string): Promise<IQuestion> => {
    const response = await api.get<{ question: IQuestion }>(`/admin/questions/${id}`);
    return response.data.question;
  },

  /**
   * Update a question (e.g. status or code modifications).
   */
  updateQuestion: async (id: string, data: Partial<IQuestion>): Promise<IQuestion> => {
    const response = await api.put<{ question: IQuestion }>(`/admin/questions/${id}`, data);
    return response.data.question;
  },

  /**
   * Delete a question.
   */
  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },
};
