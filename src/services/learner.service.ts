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
   * Get the current user's last submission (saved code) for a question.
   * Returns null if the user has never submitted for this question.
   */
  getLastSubmission: async (
    questionId: string,
  ): Promise<{ files: { filename: string; content: string }[]; status: string } | null> => {
    const response = await api.get<{
      submission: { files: { filename: string; content: string }[]; status: string } | null;
    }>(`/submissions/${questionId}`);
    return response.data.submission;
  },

  /**
   * Get user profile and stats
   */
  getProfile: async (): Promise<{ id: string; name: string; completedQuestions: string[] }> => {
    const response = await api.get<{ profile: { id: string; name: string; completedQuestions: string[] } }>('/users/profile');
    return response.data.profile;
  },

  /**
   * Get all submissions by the logged-in user
   */
  getSubmissions: async (): Promise<any[]> => {
    const response = await api.get<{ submissions: any[] }>('/submissions');
    return response.data.submissions;
  },

  /**
   * Get folders for questions
   */
  getFolders: async (): Promise<string[]> => {
    const res = await api.get<{ folders: string[] }>('/questions/folders');
    return res.data.folders || [];
  },

  /**
   * Submit code for execution / evaluation against test cases.
   */
  submitExecution: async (
    questionId: string,
    files: { filename: string; content: string }[],
    isSubmit: boolean = false
  ): Promise<{
    message: string;
    status: 'pass' | 'fail';
    output?: string;
    evaluation?: {
      summary: { total: number; passed: number; failed: number };
      results: {
        index: number;
        description: string;
        passed: boolean;
        input?: any;
        expectedOutput?: any;
        actualOutput?: any;
        executionTimeMs: number;
        error?: string;
        visible: boolean;
      }[];
    };
  }> => {
    const response = await api.post<{
      message: string;
      status: 'pass' | 'fail';
      output?: string;
      evaluation?: {
        summary: { total: number; passed: number; failed: number };
        results: {
          index: number;
          description: string;
          passed: boolean;
          input?: any;
          expectedOutput?: any;
          actualOutput?: any;
          executionTimeMs: number;
          error?: string;
          visible: boolean;
        }[];
      };
    }>('/execution/submit', {
      questionId,
      files,
      isSubmit,
    });
    return response.data;
  },

  /**
   * Dynamically execute an endpoint with payload (for Fullstack UI testing)
   */
  executeEndpoint: async (
    questionId: string,
    files: { filename: string; content: string }[],
    method: string,
    endpoint: string,
    body: any
  ): Promise<{ message: string; status: 'pass' | 'fail'; output: any }> => {
    const response = await api.post<{ message: string; status: 'pass' | 'fail'; output: any }>('/execution/run-endpoint', {
      questionId,
      files,
      method,
      endpoint,
      body,
    });
    return response.data;
  },

  /**
   * Send question and code state context to AI Chatbot buddy.
   */
  askAiAssistant: async (
    message: string,
    context: { title: string; description: string; currentCode: string }
  ): Promise<string> => {
    const response = await api.post<{ reply: string }>('/ai/ask', {
      message,
      context,
    });
    return response.data.reply;
  },
};
