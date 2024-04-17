import { monoCloudAuth } from '../../../src';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import { get, startNodeServer, stopNodeServer } from '../../page-router-helpers';

describe('Custom Auth Routes - Page Router', () => {
  let authHandler: any;
  let baseUrl: string;
  
  beforeEach(async () => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = '/api/auth/custom_login';
    setupOp(defaultDiscovery, noTokenAndUserInfo);
    authHandler = monoCloudAuth();
    baseUrl = await startNodeServer(authHandler);
  });

  afterEach(async () => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = undefined;
    authHandler = undefined;
    baseUrl = undefined as any;
    await stopNodeServer();
  });

  it('should redirect to authorize endpoint when custom signin route is called', async () => {
    const res = await get(baseUrl, '/api/auth/custom_login');

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
  });
});
