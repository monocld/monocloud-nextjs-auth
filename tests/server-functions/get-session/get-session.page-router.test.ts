import { CookieJar } from 'tough-cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, monoCloudAuth } from '../../../src';
import {
  defaultDiscovery,
  noTokenAndUserInfo,
  setupOp,
} from '../../op-helpers';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('getSession() - Page Router', () => {
  beforeEach(() => {
    setupOp(defaultDiscovery, noTokenAndUserInfo);

    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  it('should return undefined if there is no session (NextApiRequest, NextApiResponse)', async () => {
    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await getSession(req, res);

      res.end();

      expect(session).toBeUndefined();
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');
  });

  it('should return the session of the current user (NextApiRequest, NextApiResponse)', async () => {
    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await getSession(req, res);

      res.end();

      expect(session).toEqual(defaultSessionCookieValue);
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });
});
