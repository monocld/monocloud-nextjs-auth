import { getSession, protectApi } from '@monocloud/nextjs-auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default protectApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  return res.json(session?.user);
});
