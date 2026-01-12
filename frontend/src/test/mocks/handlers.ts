import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api/v1';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      user: {
        _id: '1',
        email: 'test@example.com',
        userName: 'testuser',
        role: 'member',
      },
      token: 'test-token-123',
    });
  }),

  http.post(`${API_URL}/auth/register`, () => {
    return HttpResponse.json({
      user: {
        _id: '1',
        email: 'test@example.com',
        userName: 'testuser',
        role: 'member',
      },
      token: 'test-token-123',
    });
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      user: {
        _id: '1',
        email: 'test@example.com',
        userName: 'testuser',
        role: 'member',
      },
    });
  }),

  // Workspace handlers
  http.get(`${API_URL}/workspaces`, () => {
    return HttpResponse.json({
      workspaces: [
        {
          _id: '1',
          name: 'Test Workspace',
          description: 'Test description',
          members: [{ userId: '1', role: 'admin' }],
        },
      ],
    });
  }),

  http.post(`${API_URL}/workspaces`, () => {
    return HttpResponse.json({
      workspace: {
        _id: '2',
        name: 'New Workspace',
        members: [{ userId: '1', role: 'admin' }],
      },
    });
  }),

  http.delete(`${API_URL}/workspaces/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
