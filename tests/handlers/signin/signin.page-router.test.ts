/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { monoCloudAuth } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import { getCookieValue } from '../../common-helper';

describe('SignIn Handler - Page Router', () => {
  let authHandler: any;
  let baseUrl: string;

  beforeEach(async () => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);
    authHandler = monoCloudAuth();
    baseUrl = await startNodeServer(authHandler);
  });

  afterEach(async () => {
    authHandler = undefined;
    baseUrl = undefined as any;
    await stopNodeServer();
  });

  it('should redirect to authorize endpoint', async () => {
    const res = await get(baseUrl, '/api/auth/signin');

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
    const res = await get(baseUrl, '/api/auth/signin?register=true');

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.prompt).toBe('create');
  });

  it('custom login_hint in query should redirect to authorize endpoint with login_hint', async () => {
    const res = await get(baseUrl, '/api/auth/signin?login_hint=username');

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.login_hint).toBe('username');
  });

  it('custom authenticator in query should redirect to authorize endpoint with authenticator in the acr_values', async () => {
    const res = await get(baseUrl, '/api/auth/signin?authenticator=google');

    expect(res.status).toBe(302);
    expect(res.locationHeaderPathOnly).toBe('https://op.example.com/authorize');
    expect(res.locationHeader.query.acr_values).toBe('authenticator:google');
  });

  it('should set the state cookie', async () => {
    const res = await get(baseUrl, '/api/auth/signin');

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
    const res = await get(baseUrl, '/api/auth/signin?return_url=/custom');

    const {
      state: { returnUrl },
    } = await getCookieValue(res.stateCookie.value ?? '');

    expect(returnUrl).toBe(encodeURIComponent('/custom'));
  });
});
