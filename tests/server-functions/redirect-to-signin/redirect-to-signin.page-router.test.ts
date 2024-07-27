/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { monoCloudAuth, redirectToSignIn } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('redirectToSignIn() - Page Router', () => {
  it('should throw "redirectToSignIn() can only be used in App Router project"', async () => {
    monoCloudAuth();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getServerSideProps = async (_context: any) => {
      await redirectToSignIn();
      return Promise.resolve({ props: { custom: 'prop' } });
    };

    const handler = async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        await getServerSideProps({
          req,
          res,
          query: req.query,
          resolvedUrl: req.url ?? '/',
        });
        throw new Error();
      } catch (error) {
        expect(error.message).toBe(
          'redirectToSignIn() can only be used in App Router project'
        );
      }

      res.end();
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');

    await stopNodeServer();
  });
});
