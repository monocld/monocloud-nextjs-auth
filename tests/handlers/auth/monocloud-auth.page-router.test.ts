/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import { setSessionCookie, setStateCookie } from '../../common-helper';
import {
  defaultDiscovery,
  noBodyDiscoverySuccess,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';

describe('Authentication Handler - Page Router', () => {
  let authHandler: any;
  let baseUrl: string;

  beforeEach(async () => {
    authHandler = monoCloudAuth();
    baseUrl = await startNodeServer(authHandler);
  });

  afterEach(async () => {
    authHandler = undefined;
    baseUrl = '';
    await stopNodeServer();
  });

  it('should return 500 for unexpected errors', async () => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);
    const response = await fetch(
      `${baseUrl}/api/auth/callback?error=foo&error_description=bar&state=foo`
    );

    expect(response.status).toBe(500);
  });

  it('signin endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);
    const response = await fetch(`${baseUrl}/api/auth/signin`);

    expect(response.status).toBe(500);
  });

  it('callback endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}/api/auth/callback`);

    const response = await get(baseUrl, '/api/auth/callback', cookieJar);

    expect(response.status).toBe(500);
  });

  it('signout endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/api/auth/signout`);

    const response = await get(baseUrl, '/api/auth/signout', cookieJar);

    expect(response.status).toBe(500);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/auth/unknown`);

    expect(response.status).toBe(404);
  });

  [
    [['DELETE', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'HEAD'], '/api/auth/signin'],
    [['DELETE', 'OPTIONS', 'PUT', 'PATCH', 'HEAD'], '/api/auth/callback'],
    [
      ['DELETE', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'HEAD'],
      '/api/auth/userinfo',
    ],
    [
      ['DELETE', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'HEAD'],
      '/api/auth/signout',
    ],
  ].forEach(([methods, endpoint]) => {
    (methods as string[]).forEach(method => {
      it(`should return 405 on ${endpoint} for request type ${method}`, async () => {
        setupOp(defaultDiscovery, noTokenAndUserInfo);

        const response = await fetch(`${baseUrl}${endpoint}`, { method });

        expect(response.status).toBe(405);
      });
    });
  });
});
