import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import { setupOp } from '../../op-helpers';
import { TestAppRes, setSessionCookie } from '../../common-helper';

describe('SignOut Handler - App Router', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authHandler: any;

  beforeEach(async () => {
    await setupOp();
    authHandler = monoCloudAuth();
  });

  afterEach(() => {
    authHandler = undefined;
  });

  it('should remove the session and redirect to authorization server', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signout');

    await setSessionCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

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
        post_logout_redirect_uri: 'https://example.org/something',
        id_token_hint: 'idtoken',
        client_id: '__test_client_id__',
      });
      expect(res.sessionCookie.value).toBeUndefined();
      expect(res.sessionCookie.options.expires).toEqual(new Date(0));
    });
  });

  it('can redirect to external domains', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/auth/signout?post_logout_url=https://something.com/test'
    );

    await setSessionCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

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
    const req = new NextRequest('http://localhost:3000/api/auth/signout');

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value).toBeUndefined();
  });
});
