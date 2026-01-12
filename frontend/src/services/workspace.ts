import { api } from './api';
import type { Workspace } from './api';

// Workspace API endpoints
export const workspaceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all workspaces for current user
    getWorkspaces: builder.query<{ workspaces: Workspace[] }, void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),

    // Get single workspace
    getWorkspace: builder.query<{ workspace: Workspace }, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}`,
      providesTags: ['Workspace'],
    }),

    // Create workspace
    createWorkspace: builder.mutation<
      { workspace: Workspace },
      { name: string; description?: string }
    >({
      query: (workspaceData) => ({
        url: '/workspaces',
        method: 'POST',
        body: workspaceData,
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Update workspace
    updateWorkspace: builder.mutation<
      { workspace: Workspace },
      { workspaceId: string; updates: { name?: string; description?: string } }
    >({
      query: ({ workspaceId, updates }) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Delete workspace
    deleteWorkspace: builder.mutation<void, string>({
      query: (workspaceId) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Add member to workspace
    addMember: builder.mutation<
      { workspace: Workspace },
      { workspaceId: string; userId: string; role?: 'admin' | 'member' }
    >({
      query: ({ workspaceId, userId, role }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: 'POST',
        body: { userId, role },
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Remove member from workspace
    removeMember: builder.mutation<void, { workspaceId: string; userId: string }>({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = workspaceApi;
