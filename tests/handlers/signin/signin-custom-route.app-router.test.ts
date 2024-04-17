import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import { TestAppRes } from '../../common-helper';

describe('Custom Auth Routes - App Router', () => {
  let authHandler: any;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = '/api/auth/custom_login';
    setupOp(defaultDiscovery, noTokenAndUserInfo);
    authHandler = monoCloudAuth();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = undefined;
    authHandler = undefined;
  });

  it('should redirect to authorize endpoint when custom signin route is called', async () => {
    const serverResponse = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/custom_login')),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
  });
});
