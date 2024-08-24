import { NextApiRequest, NextApiResponse } from 'next';
import { monoCloudAuth } from '../../../src';
import { setupOp } from '../../op-helpers';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('MonoCloud Auth - Page Router: onError', () => {
  it('can pass onError to monoCloudAuth() to handle errors', async () => {
    setupOp({ body: {}, status: 500 });

    const authHandler = monoCloudAuth({
      onError: (_req: NextApiRequest, res: NextApiResponse) =>
        res.json({ custom: true }),
    });

    const baseUrl = await startNodeServer(authHandler);

    const response = await get(baseUrl, '/api/auth/signin');

    expect(response.status).toBe(200);
    expect(await response.getBody()).toEqual({ custom: true });

    await stopNodeServer();
  });
});
