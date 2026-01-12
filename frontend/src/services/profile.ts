import { api } from './api';
import type { User } from './api';

// User profile API endpoints
export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query<{ user: User }, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: ['User'],
    }),

    // Update user profile
    updateProfile: builder.mutation<
      { user: User },
      {
        userId: string;
        updates: {
          userName?: string;
          firstName?: string;
          lastName?: string;
          avatarUrl?: string;
        };
      }
    >({
      query: ({ userId, updates }) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Delete user account
    deleteAccount: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} = profileApi;
