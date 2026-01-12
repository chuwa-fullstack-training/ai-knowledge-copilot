import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Types for API responses
export interface User {
  _id: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: Array<{
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  workspaceId: string;
  title: string;
  content: string;
  type: 'markdown' | 'text' | 'code';
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  workspaceId?: string;
  documentId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Base API configuration with RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Workspace', 'Document', 'Chat'],
  endpoints: () => ({}), // Endpoints will be injected by feature slices
});
