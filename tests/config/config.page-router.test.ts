import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../src';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
  tokenAndUserInfoEnabled,
} from '../op-helpers';
import { get, startNodeServer, stopNodeServer } from '../page-router-helpers';
import {
  defaultStateCookieValue,
  setSessionCookie,
  setStateCookie,
} from '../common-helper';

describe('Base Path', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authHandler: any;
  let baseUrl: string;

  beforeEach(async () => {
    process.env.MONOCLOUD_AUTH_APP_URL = 'https://example.org/basepath';

    authHandler = monoCloudAuth();
    baseUrl = await startNodeServer(authHandler);
  });

  afterEach(async () => {
    authHandler = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseUrl = undefined as any;
    await stopNodeServer();
    process.env.MONOCLOUD_AUTH_APP_URL = undefined;
  });

  it('should have the base path in redirect uri', async () => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);

    const res = await get(baseUrl, '/api/auth/signin');

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

    baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/callback?state=state&nonce=nonce&code=code';

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}${path}`);

    const res = await get(baseUrl, path, cookieJar);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/basepath');

    await stopNodeServer();
  });

  it('should have base path in return url when set through query from signin after callback', async () => {
    await setupOp(
      undefined,
      tokenAndUserInfoEnabled,
      {},
      'https://example.org/basepath/api/auth/callback'
    );

    baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/callback?state=state&nonce=nonce&code=code';

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}${path}`, {
      ...defaultStateCookieValue,
      returnUrl: encodeURIComponent('/custom'),
    });

    const res = await get(baseUrl, path, cookieJar);

    expect(res.locationHeaderPathOnly).toBe(
      'https://example.org/basepath/custom'
    );
  });

  it('should remove the session and redirect to authorization server (with base path in post logout uri)', async () => {
    const path = '/api/auth/signout';

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}${path}`);

    const res = await get(baseUrl, path, cookieJar);

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
    it('should assign the post_logout_redirect_uri from the query', async () => {
      const path = `/api/auth/signout?post_logout_url=${url}`;

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}${path}`);

      const res = await get(baseUrl, path, cookieJar);

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

  it('should redirect to app url if there is no session', async () => {
    const path = '/api/auth/signout';

    const res = await get(baseUrl, path);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/basepath');
    expect(res.sessionCookie.value).toBeUndefined();
  });
});
