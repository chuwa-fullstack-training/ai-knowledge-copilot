import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import type { Express } from 'express';

describe('Authentication API', () => {
  let app: Express;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  test('Health check endpoint returns 200', async () => {
    const response = await fetch('http://localhost:3000/health');
    const data = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
  });

  test('Registration requires valid email and password', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'weak',
      }),
    });

    const data = (await response.json()) as { error: string };
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation Error');
  });
});
