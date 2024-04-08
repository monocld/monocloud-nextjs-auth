// eslint-disable-next-line import/no-extraneous-dependencies
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('UserInfo Handler - Page Router', () => {
  it('should return the current user claims', async () => {
    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/userinfo';

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}${path}`, {
      ...defaultSessionCookieValue,
      user: { sub: 'marine', noice: 'toit' },
    });

    const res = await get(baseUrl, path, cookieJar);

    await stopNodeServer();

    expect(await res.getBody()).toEqual({ sub: 'marine', noice: 'toit' });
  });

  it('should return no content if there is no session', async () => {
    const authHandler = monoCloudAuth();

    const baseUrl = await startNodeServer(authHandler);
    const path = '/api/auth/userinfo';

    const res = await get(baseUrl, path);

    await stopNodeServer();

    expect(res.status).toBe(204);
  });
});
