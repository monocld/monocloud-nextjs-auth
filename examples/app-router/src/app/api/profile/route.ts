import { getSession, protectApi } from '@monocloud/nextjs-auth';
import { NextResponse } from 'next/server';

export const GET = protectApi(async () => {
  const session = await getSession();
  return NextResponse.json(session?.user);
});

export const dynamic = 'force-dynamic';
