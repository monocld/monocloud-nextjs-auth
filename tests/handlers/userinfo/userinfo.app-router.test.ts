import { NextRequest } from 'next/server';
import { monoCloudAuth } from '../../../src';
import {
  TestAppRes,
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';

describe('UserInfo Handler - App Router', () => {
  it('should return the current user claims', async () => {
    const authHandler = monoCloudAuth();

    const req = new NextRequest('http://localhost:3000/api/auth/userinfo');

    await setSessionCookie(req, '', {
      ...defaultSessionCookieValue,
      user: { sub: 'marine', noice: 'toit' },
    });

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(await res.getBody()).toEqual({ sub: 'marine', noice: 'toit' });
  });

  it('should return no content if there is no session', async () => {
    const authHandler = monoCloudAuth();

    const req = new NextRequest('http://localhost:3000/api/auth/userinfo');

    const response = await authHandler(req);

    const res = new TestAppRes(response);

    expect(res.status).toBe(204);
  });
});
