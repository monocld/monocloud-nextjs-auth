import { NextRequest, NextResponse } from 'next/server';
import { monoCloudAuth } from '../../../src';
import { setupOp } from '../../op-helpers';

describe('MonoCloud Auth - App Router: onError', () => {
  it('can pass onError to monoCloudAuth() to handle errors', async () => {
    setupOp({ body: {}, status: 500 });

    const authHandler = monoCloudAuth({
      onError: () => NextResponse.json({ custom: true }),
    });

    const req = new NextRequest('http://localhost:3000/api/auth/signin');

    const response = await authHandler(req, {});

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ custom: true });
  });
});
