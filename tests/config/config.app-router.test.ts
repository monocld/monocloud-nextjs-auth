import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../src';
import { setupOp, tokenAndUserInfoEnabled } from '../op-helpers';
import {
  TestAppRes,
  defaultStateCookieValue,
  setSessionCookie,
  setStateCookie,
} from '../common-helper';

describe('Base Path', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authHandler: any;

  beforeEach(() => {
    process.env.MONOCLOUD_AUTH_APP_URL = 'https://example.org/basepath';
    authHandler = monoCloudAuth();
  });

  afterEach(() => {
    process.env.MONOCLOUD_AUTH_APP_URL = undefined;
  });

  test('should have the base path in redirect uri', async () => {
    setupOp();

    const serverResponse = await authHandler(
      new NextRequest(new URL('http://localhost:3000/api/auth/signin')),
      {}
    );

    const res = new TestAppRes(serverResponse);

    expect(res.status).toBe(302);
    expect(res.locationHeader.query.redirect_uri).toBe(
      'https://example.org/basepath/api/auth/callback'
    );
  });

  it('should redirect to app url with base path after callback', async () => {
    await setupOp(
      undefined,
      tokenAndUserInfoEnabled,
      {},
      'https://example.org/basepath/api/auth/callback'
    );

    const req = new NextRequest(
      'http://localhost:3000/api/auth/callback?state=state&nonce=nonce&code=code'
    );

    await setStateCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/basepath');
  });

  it('should have base path in return url when set through query from signin after callback', async () => {
    await setupOp(
      undefined,
      tokenAndUserInfoEnabled,
      {},
      'https://example.org/basepath/api/auth/callback'
    );

    const req = new NextRequest(
      `http://localhost:3000/api/auth/callback?state=state&nonce=state&code=code`
    );

    await setStateCookie(req, '', {
      ...defaultStateCookieValue,
      returnUrl: encodeURIComponent('/custom'),
    });

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe(
      'https://example.org/basepath/custom'
    );
  });

  it('should remove the session and redirect to authorization server (with base path in post logout uri)', async () => {
    await setupOp(
      undefined,
      tokenAndUserInfoEnabled,
      {},
      'https://example.org/basepath/api/auth/callback'
    );

    const req = new NextRequest('http://localhost:3000/api/auth/signout');

    await setSessionCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe(
      'https://op.example.com/endsession'
    );
    expect(res.locationHeader.query).toEqual({
      post_logout_redirect_uri: 'https://example.org/basepath',
      id_token_hint: 'idtoken',
      client_id: '__test_client_id__',
    });
    expect(res.sessionCookie.value).toBeUndefined();
    expect(res.sessionCookie.options.expires).toEqual(new Date(0));
  });

  ['/something', 'https://example.org/basepath/something'].forEach(url => {
    it('should assign the post_logout_redirect_uri from the query (with base path)', async () => {
      await setupOp(
        undefined,
        tokenAndUserInfoEnabled,
        {},
        'https://example.org/basepath/api/auth/callback'
      );

      const req = new NextRequest(
        `http://localhost:3000/api/auth/signout?post_logout_url=${url}`
      );

      await setSessionCookie(req);

      const response = await authHandler(req);

      const res = new TestAppRes(response);

      expect(res.locationHeaderPathOnly).toBe(
        'https://op.example.com/endsession'
      );
      expect(res.locationHeader.query).toEqual({
        post_logout_redirect_uri: 'https://example.org/basepath/something',
        id_token_hint: 'idtoken',
        client_id: '__test_client_id__',
      });
      expect(res.sessionCookie.value).toBeUndefined();
      expect(res.sessionCookie.options.expires).toEqual(new Date(0));
    });
  });

  it('should redirect to app url with base path if there is no session', async () => {
    await setupOp(
      undefined,
      tokenAndUserInfoEnabled,
      {},
      'https://example.org/basepath/api/auth/callback'
    );

    const req = new NextRequest('http://localhost:3000/api/auth/signout');

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/basepath');
    expect(res.sessionCookie.value).toBeUndefined();
  });
});
