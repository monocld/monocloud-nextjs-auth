/* eslint-disable import/no-extraneous-dependencies */
import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import { TestAppRes, getCookieValue } from '../../common-helper';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';

describe('SignIn Handler - App Router', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authHandler: any;

  beforeEach(() => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);
    authHandler = monoCloudAuth();
  });

  afterEach(() => {
    authHandler = undefined;
  });

  it('should redirect to authorize endpoint', async () => {
    const serverResponse = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/signin')),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query).toEqual({
      client_id: '__test_client_id__',
      scope: 'openid profile email read:customer',
      response_type: 'code',
      redirect_uri: 'https://example.org/api/auth/callback',
      nonce: expect.any(String),
      state: expect.any(String),
      code_challenge: expect.any(String),
      code_challenge_method: 'S256',
    });
  });

  it('register=true in query should redirect to authorize endpoint with prompt=create', async () => {
    const serverResponse = await authHandler(
      new NextRequest(
        new URL('http://localhost:3000/api/auth/signin?register=true')
      ),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.prompt).toBe('create');
  });

  it('custom login_hint in query should redirect to authorize endpoint with login_hint', async () => {
    const serverResponse = await authHandler(
      new NextRequest(
        new URL('http://localhost:3000/api/auth/signin?login_hint=username')
      ),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.login_hint).toBe('username');
  });

  it('custom authenticator in query should redirect to authorize endpoint with authenticator in the authenticator_hint', async () => {
    const serverResponse = await authHandler(
      new NextRequest(
        new URL(
          'http://localhost:3000/api/auth/signin?authenticator_hint=google'
        )
      ),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.authenticator_hint).toBe('google');
  });

  it('should set the state cookie', async () => {
    const serverResponse = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/signin')),
      {}
    );

    const res = new TestAppRes(serverResponse);

    const { value, options } = res.stateCookie;

    expect(value?.trim().length).toBeGreaterThan(0);
    expect(options).toEqual({
      path: '/',
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      domain: 'localhost',
      expires: 'Infinity',
    });
  });

  it('should set the custom return url in the state', async () => {
    const serverResponse = await authHandler(
      new NextRequest(
        new URL('http://localhost:3000/api/auth/signin?return_url=/custom')
      ),
      {}
    );

    const res = new TestAppRes(serverResponse);

    const {
      state: { returnUrl },
    } = await getCookieValue(res.stateCookie.value ?? '');

    expect(returnUrl).toBe(encodeURIComponent('/custom'));
  });
});
