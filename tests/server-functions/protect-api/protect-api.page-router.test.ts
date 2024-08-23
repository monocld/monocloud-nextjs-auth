import { NextApiRequest, NextApiResponse } from 'next';
import { CookieJar } from 'tough-cookie';
import { monoCloudAuth, protectApi } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';
import {
  defaultSessionCookieValue,
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';

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

  describe('groups', () => {
    it('should allow access to api if user belongs to any of the listed groups', async () => {
      monoCloudAuth();

      const api = protectApi(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: NextApiRequest, res: NextApiResponse<object>) =>
          res.json({ success: true }),
        { groups: ['test'] }
      );

      const baseUrl = await startNodeServer(api);

      const cookieJar = new CookieJar();

      await setSessionCookie(
        cookieJar,
        `${baseUrl}/api/someroute`,
        userWithGroupsSessionCookieValue
      );

      const res = await get(baseUrl, '/api/someroute', cookieJar);

      await stopNodeServer();

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        success: true,
      });
    });

    it('can customize the groups claim', async () => {
      monoCloudAuth();

      const api = protectApi(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: NextApiRequest, res: NextApiResponse<object>) =>
          res.json({ success: true }),
        { groups: ['test'], groupsClaim: 'CUSTOM_GROUPS' }
      );

      const baseUrl = await startNodeServer(api);

      const cookieJar = new CookieJar();

      await setSessionCookie(cookieJar, `${baseUrl}/api/someroute`, {
        ...defaultSessionCookieValue,
        user: { ...defaultSessionCookieValue.user, CUSTOM_GROUPS: ['test'] },
      });

      const res = await get(baseUrl, '/api/someroute', cookieJar);

      await stopNodeServer();

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        success: true,
      });
    });

    it('should not allow access to api if user does not belongs to any of the listed groups', async () => {
      monoCloudAuth();

      const api = protectApi(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: NextApiRequest, res: NextApiResponse<object>) =>
          res.json({ success: true }),
        { groups: ['NOPE'] }
      );

      const baseUrl = await startNodeServer(api);

      const cookieJar = new CookieJar();

      await setSessionCookie(
        cookieJar,
        `${baseUrl}/api/someroute`,
        userWithGroupsSessionCookieValue
      );

      const res = await get(baseUrl, '/api/someroute', cookieJar);

      await stopNodeServer();

      expect(res.status).toBe(403);
      expect(await res.getBody()).toEqual({
        message: 'forbidden',
      });
    });

    it('can set custom onAccessDenied handler', async () => {
      monoCloudAuth();

      const api = protectApi(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_req: NextApiRequest, res: NextApiResponse<object>) =>
          res.json({ success: true }),
        {
          groups: ['NOPE'],
          onAccessDenied: (_req, res) => res.json({ custom: true }),
        }
      );

      const baseUrl = await startNodeServer(api);

      const cookieJar = new CookieJar();

      await setSessionCookie(
        cookieJar,
        `${baseUrl}/api/someroute`,
        userWithGroupsSessionCookieValue
      );

      const res = await get(baseUrl, '/api/someroute', cookieJar);

      await stopNodeServer();

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        custom: true,
      });
    });
  });
});
