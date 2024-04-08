import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import {
  noBodyDiscoverySuccess,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import { setSessionCookie } from '../../common-helper';

describe('MonoCloud Auth - App Router: userinfo op error', () => {
  beforeEach(() => {
    process.env.MONOCLOUD_AUTH_REFRESH_USER_INFO = 'true';
  });

  afterEach(() => {
    process.env.MONOCLOUD_AUTH_REFRESH_USER_INFO = undefined;
  });

  it('userinfo endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const authHandler = monoCloudAuth();

    const req = new NextRequest('http://localhost:3000/api/auth/userinfo');

    await setSessionCookie(req);

    const response = await authHandler(req, {});

    expect(response.status).toBe(500);
  });
});
