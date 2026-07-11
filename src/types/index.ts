// ============================
// Core TypeScript Interfaces
// ============================

// User
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'learner';
  createdAt: string;
  updatedAt: string;
}

// Question
export interface IQuestion {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'react' | 'nestjs' | 'fullstack';
  topic: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  starterCode: IStarterFile[];
  editableFiles: string[];
  visibleTests: ITestCase[];
  hiddenTestCount: number;
  createdAt: string;
  updatedAt: string;
}

// Starter File
export interface IStarterFile {
  filename: string;
  content: string;
  language: string;
  editable: boolean;
}

// Test Case
export interface ITestCase {
  _id: string;
  questionId: string;
  description: string;
  type: 'visible' | 'hidden';
  expectedStatus?: number;
  expectedBody?: Record<string, unknown>;
  expectedFields?: string[];
  endpoint?: string;
  method?: string;
  requestBody?: Record<string, unknown>;
}

// Attempt
export interface IAttempt {
  _id: string;
  userId: string;
  questionId: string;
  status: 'correct' | 'wrong' | 'error' | 'timeout';
  timeTaken: number;
  passedTests: number;
  totalTests: number;
  createdAt: string;
}

// Progress
export interface IProgress {
  _id: string;
  userId: string;
  questionId: string;
  attempts: number;
  solved: boolean;
  bestTime: number | null;
  accuracy: number;
  lastAttemptAt: string | null;
}

// Execution Result
export interface IExecutionResult {
  success: boolean;
  status: 'correct' | 'wrong' | 'error' | 'timeout';
  passedTests: number;
  totalTests: number;
  results: ITestResult[];
  executionTime: number;
}

export interface ITestResult {
  description: string;
  passed: boolean;
  expected?: string;
  actual?: string;
  error?: string;
}

// API Response
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// API Error Response
export interface IApiError {
  success: boolean;
  statusCode: number;
  message: string;
  errors: string[] | null;
  timestamp: string;
  path: string;
}

// Auth
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

// Editor
export interface IEditorFile {
  filename: string;
  content: string;
  language: string;
  editable: boolean;
}

export interface ISubmission {
  questionId: string;
  files: Array<{
    filename: string;
    content: string;
  }>;
}
