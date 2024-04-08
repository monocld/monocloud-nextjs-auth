// eslint-disable-next-line import/no-extraneous-dependencies
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../../src';
import { setSessionCookie } from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import {
  noBodyDiscoverySuccess,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';

describe('MonoCloud Auth - Page Router: userinfo op error', () => {
  beforeEach(() => {
    process.env.MONOCLOUD_AUTH_REFRESH_USER_INFO = 'true';
  });

  afterEach(() => {
    process.env.MONOCLOUD_AUTH_REFRESH_USER_INFO = undefined;
  });

  it('userinfo endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/api/auth/userinfo`);

    const response = await get(baseUrl, '/api/auth/userinfo', cookieJar);

    expect(response.status).toBe(500);

    await stopNodeServer();
  });
});
