// eslint-disable-next-line import/no-extraneous-dependencies
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../../src';
import { setupOp } from '../../op-helpers';
import { setSessionCookie } from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('SignOut Handler - Page Router', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let baseUrl: any;

  beforeEach(async () => {
    await setupOp();
    const authHandler = monoCloudAuth();
    baseUrl = await startNodeServer(authHandler);
  });

  afterEach(async () => {
    baseUrl = undefined;
    await stopNodeServer();
  });

  it('should remove the session and redirect to authorization server', async () => {
    const path = '/api/auth/signout';

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}${path}`);

    const res = await get(baseUrl, path, cookieJar);

    expect(res.locationHeaderPathOnly).toBe(
      'https://op.example.com/endsession'
    );
    expect(res.locationHeader.query).toEqual({
      post_logout_redirect_uri: 'https://example.org',
      id_token_hint: 'idtoken',
      client_id: '__test_client_id__',
    });
    expect(res.sessionCookie.value).toBeUndefined();
    expect(res.sessionCookie.options.expires).toEqual(new Date(0));
  });

  ['/something', 'https://example.org/something'].forEach(url => {
    it('should assign the post_logout_redirect_uri from the query', async () => {
      const path = `/api/auth/signout?post_logout_url=${url}`;

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}${path}`);

      const res = await get(baseUrl, path, cookieJar);

      expect(res.locationHeaderPathOnly).toBe(
        'https://op.example.com/endsession'
      );
      expect(res.locationHeader.query).toEqual({
        post_logout_redirect_uri: 'https://example.org/something',
        id_token_hint: 'idtoken',
        client_id: '__test_client_id__',
      });
      expect(res.sessionCookie.value).toBeUndefined();
      expect(res.sessionCookie.options.expires).toEqual(new Date(0));
    });
  });

  it('can redirect to external domains', async () => {
    const path = '/api/auth/signout?post_logout_url=https://something.com/test';

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}${path}`);

    const res = await get(baseUrl, path, cookieJar);

    expect(res.locationHeaderPathOnly).toBe(
      'https://op.example.com/endsession'
    );
    expect(res.locationHeader.query).toEqual({
      post_logout_redirect_uri: 'https://something.com/test',
      id_token_hint: 'idtoken',
      client_id: '__test_client_id__',
    });
    expect(res.sessionCookie.value).toBeUndefined();
    expect(res.sessionCookie.options.expires).toEqual(new Date(0));
  });

  it('should redirect to app url if there is no session', async () => {
    const path = '/api/auth/signout';

    const res = await get(baseUrl, path);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value).toBeUndefined();
  });
});
