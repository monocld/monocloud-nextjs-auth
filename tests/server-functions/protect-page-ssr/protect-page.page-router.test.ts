/* eslint-disable @typescript-eslint/no-explicit-any */
import { CookieJar } from 'tough-cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { monoCloudAuth, protectPage } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('protectPage() - Page Router', () => {
  beforeEach(() => {
    monoCloudAuth();
  });

  afterEach(async () => {
    await stopNodeServer();
  });

  it('should return serverside props with the current user when the request is authenticated', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props.user).toEqual(defaultSessionCookieValue.user);
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should execute custom getServerSideProps()', async () => {
    const getServerSideProps = (context: any) => {
      expect(context.req).toBeDefined();
      expect(context.res).toBeDefined();
      return Promise.resolve({ props: { custom: 'prop' } });
    };

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props.user).toEqual(defaultSessionCookieValue.user);
      expect(result.props.custom).toEqual('prop');
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should handle promises as props in getServerSideProps()', async () => {
    const getServerSideProps = (context: any) => {
      expect(context.req).toBeDefined();
      expect(context.res).toBeDefined();
      return Promise.resolve({ props: Promise.resolve({ custom: 'prop' }) });
    };

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.props).toBeInstanceOf(Promise);

      expect(result.props).resolves.toEqual({
        user: defaultSessionCookieValue.user,
        custom: 'prop',
      });
    };

    const baseUrl = await startNodeServer(handler);

    const cookieJar = new CookieJar();

    await setSessionCookie(cookieJar, `${baseUrl}/`);

    await get(baseUrl, '/', cookieJar);
  });

  it('should not execute custom getServerSideProps for unauthenticated requests', async () => {
    const getServerSideProps = jest.fn();

    const serverSideProps = protectPage({ getServerSideProps });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2F',
      });
      expect(getServerSideProps).toHaveBeenCalledTimes(0);
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');
  });

  it('should redirect to sign in when there is no session', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2F',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');
  });

  it('should pickup return url from the resolvedUrl of the request', async () => {
    const serverSideProps = protectPage();

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination: 'https://example.org/api/auth/signin?return_url=%2Ftest',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/test');
  });

  it('should pickup return url from options', async () => {
    const serverSideProps = protectPage({ returnUrl: '/overrides' });

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      const result: any = await serverSideProps({
        req,
        res,
        query: req.query,
        resolvedUrl: req.url ?? '/',
      });

      res.end();

      expect(result.redirect).toEqual({
        permanent: false,
        destination:
          'https://example.org/api/auth/signin?return_url=%2Foverrides',
      });
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/test');
  });
});
