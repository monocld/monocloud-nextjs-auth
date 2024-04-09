import { monoCloudAuth } from '@monocloud/nextjs-auth';

export const GET = monoCloudAuth();

export const fetchCache = 'force-no-store';
export const runtime = 'edge';
