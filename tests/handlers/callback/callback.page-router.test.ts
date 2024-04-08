/* eslint-disable import/no-extraneous-dependencies */
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../../src';
import { defaultAppUserInfoResponse, setupOp } from '../../op-helpers';
import {
  get,
  post,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import { defaultStateCookieValue, setStateCookie } from '../../common-helper';

describe('Callback Handler - Page Router', () => {
  it('should redirect to app url after callback', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/callback?state=state&nonce=nonce&code=code';

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}${path}`);

    const res = await get(baseUrl, path, cookieJar);

    const userInfoRes = await get(baseUrl, '/api/auth/userinfo', res.cookieJar);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value?.trim().length).toBeGreaterThan(1);

    expect(await userInfoRes.getBody()).toMatchObject(
      defaultAppUserInfoResponse
    );

    await stopNodeServer();
  });

  it('should process a callback via post', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/callback?state=state&nonce=nonce&code=code';

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}${path}`);

    const res = await post(baseUrl, path, {
      cookieJar,
      body: 'state=state&nonce=nonce&code=code',
    });

    const userInfoRes = await get(baseUrl, '/api/auth/userinfo', res.cookieJar);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value?.trim().length).toBeGreaterThan(1);

    expect(await userInfoRes.getBody()).toMatchObject(
      defaultAppUserInfoResponse
    );

    await stopNodeServer();
  });

  // refer test: 'should set the custom return url in the state' in sigin in handler
  it('should redirect to return url set through query from signin after callback', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/callback?state=state&nonce=nonce&code=code';

    const cookieJar = new CookieJar();

    await setStateCookie(cookieJar, `${baseUrl}${path}`, {
      ...defaultStateCookieValue,
      returnUrl: encodeURIComponent('/custom'),
    });

    const res = await get(baseUrl, path, cookieJar);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/custom');
  });
});
