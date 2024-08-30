/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { monoCloudAuth, protect } from '../../../src';
import {
  get,
  startNodeServer,
  stopNodeServer,
} from '../../page-router-helpers';

describe('protect() - Page Router', () => {
  it('should throw "protect() can only be used in App Router project"', async () => {
    monoCloudAuth();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getServerSideProps = async (_context: any) => {
      await protect();
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
          'protect() can only be used in App Router project'
        );
      }

      res.end();
    };

    const baseUrl = await startNodeServer(handler);

    await get(baseUrl, '/');

    await stopNodeServer();
  });
});
