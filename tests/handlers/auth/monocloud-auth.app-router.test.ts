/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import { setSessionCookie, setStateCookie } from '../../common-helper';
import {
  defaultDiscovery,
  noBodyDiscoverySuccess,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';

describe('Authentication Handler - App Router', () => {
  let authHandler: any;

  beforeEach(() => {
    authHandler = monoCloudAuth();
  });

  afterEach(() => {
    authHandler = undefined;
  });

  it('should return 500 for unexpected errors', async () => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);

    const response = await authHandler(
      new NextRequest(
        new URL(
          'http://localhost:3000/api/auth/callback?error=foo&error_description=bar&state=foo'
        )
      ),
      {}
    );
    expect(response.status).toBe(500);
  });

  it('signin endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const response = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/signin')),
      {}
    );

    expect(response.status).toBe(500);
  });

  it('callback endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const req = new NextRequest(
      'http://localhost:3000/api/auth/callback?state=state&nonce=nonce&code=code'
    );

    await setStateCookie(req);

    const response = await authHandler(req, {});

    expect(response.status).toBe(500);
  });

  it('signout endpoint should return 500 for authorization server errors', async () => {
    setupOp(noBodyDiscoverySuccess, noTokenAndUserInfo);

    const req = new NextRequest('http://localhost:3000/api/auth/signout');

    await setSessionCookie(req);

    const response = await authHandler(req, {});

    expect(response.status).toBe(500);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/unknown')),
      {}
    );
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

        const response = await authHandler(
          new NextRequest(new URL(`http://localhost:3000${endpoint}`), {
            method,
          }),
          {}
        );
        expect(response.status).toBe(405);
      });
    });
  });
});
