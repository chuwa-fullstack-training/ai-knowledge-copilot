import { api } from './api';
import type { AuthResponse, User } from './api';

// Auth API endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register mutation
    register: builder.mutation<
      AuthResponse,
      {
        email: string;
        password: string;
        userName?: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
      }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get current user query
    getCurrentUser: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth', 'User'],
    }),

    // Logout (client-side only)
    logout: builder.mutation<void, void>({
      queryFn: () => {
        localStorage.removeItem('token');
        return { data: undefined };
      },
      invalidatesTags: ['Auth', 'User', 'Workspace', 'Document', 'Chat'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
