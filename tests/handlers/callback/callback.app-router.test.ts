import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import { defaultAppUserInfoResponse, setupOp } from '../../op-helpers';
import {
  TestAppRes,
  defaultStateCookieValue,
  setStateCookie,
} from '../../common-helper';

describe('Callback Handler - App Router', () => {
  it('should redirect to app url after callback', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const req = new NextRequest(
      'http://localhost:3000/api/auth/callback?state=state&nonce=nonce&code=code'
    );

    await setStateCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    const userInfoReq = new NextRequest(
      'http://localhost:3000/api/auth/userinfo'
    );

    userInfoReq.cookies.set('session', res.sessionCookie.value ?? '');

    const userInfoResponse = await authHandler(userInfoReq);
    const userInfoRes = new TestAppRes(userInfoResponse);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value?.trim().length).toBeGreaterThan(1);

    expect(await userInfoRes.getBody()).toMatchObject(
      defaultAppUserInfoResponse
    );
  });

  it('should process a post request', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const headers = new Headers();
    headers.set('content-type', 'application/x-www-form-urlencoded');

    const rawReq = new Request('http://localhost:3000/api/auth/callback', {
      method: 'POST',
      body: 'state=state&nonce=nonce&code=code',
      headers,
    });

    const req = new NextRequest(rawReq);

    await setStateCookie(req);

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    const userInfoReq = new NextRequest(
      'http://localhost:3000/api/auth/userinfo'
    );

    userInfoReq.cookies.set('session', res.sessionCookie.value ?? '');

    const userInfoResponse = await authHandler(userInfoReq);
    const userInfoRes = new TestAppRes(userInfoResponse);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/');
    expect(res.sessionCookie.value?.trim().length).toBeGreaterThan(1);

    expect(await userInfoRes.getBody()).toMatchObject(
      defaultAppUserInfoResponse
    );
  });

  // refer test: 'should set the custom return url in the state' in sigin in handler
  it('should redirect to return url set through query from signin after callback', async () => {
    await setupOp();

    const authHandler = monoCloudAuth();

    const req = new NextRequest(
      `http://localhost:3000/api/auth/callback?state=state&nonce=state&code=code`
    );

    await setStateCookie(req, '', {
      ...defaultStateCookieValue,
      returnUrl: encodeURIComponent('/custom'),
    });

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.locationHeaderPathOnly).toBe('https://example.org/custom');
  });
});
