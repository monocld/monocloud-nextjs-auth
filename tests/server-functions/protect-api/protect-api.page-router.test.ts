import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth, protectApi } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import { setSessionCookie } from '../../common-helper';

describe('protectApi() - Page Router', () => {
  it('should return unauthorized for requests with no session', async () => {
    monoCloudAuth();

    const api = protectApi(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_req: NextApiRequest, res: NextApiResponse<object>) =>
        res.json({ success: true })
    );

    const baseUrl = await startNodeServer(api);

    const res = await get(baseUrl, '/api/someroute');

    await stopNodeServer();

    expect(res.status).toBe(401);
    expect(await res.getBody()).toEqual({
      message: 'unauthorized',
    });
  });

  it('should allow requests with session', async () => {
    monoCloudAuth();

    const api = protectApi(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_req: NextApiRequest, res: NextApiResponse<object>) =>
        res.json({ success: true })
    );

    const baseUrl = await startNodeServer(api);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/api/someroute`);

    const res = await get(baseUrl, '/api/someroute', cookieJar);

    await stopNodeServer();

    expect(res.status).toBe(200);
    expect(await res.getBody()).toEqual({
      success: true,
    });
  });
});
