import { NextRequest, NextResponse } from 'next/server';
import { monoCloudAuth, protectApi } from '../../../src';
import { TestAppRes, setSessionCookie } from '../../common-helper';

describe('protectApi() - App Router', () => {
  it('should return unauthorized for requests with no session', async () => {
    monoCloudAuth();

    const api = protectApi(() => NextResponse.json({ success: true }));

    const req = new NextRequest('http://localhost:3000/api/someroute');
    const response = await api(req, { params: {} });

    const res = new TestAppRes(response);

    expect(res.status).toBe(401);
    expect(await res.getBody()).toEqual({
      message: 'unauthorized',
    });
  });

  it('should allow requests with session', async () => {
    monoCloudAuth();

    const api = protectApi(() => NextResponse.json({ success: true }));

    const req = new NextRequest('http://localhost:3000/api/someroute');

    await setSessionCookie(req);

    const response = await api(req, { params: {} });

    const res = new TestAppRes(response);

    expect(res.status).toBe(200);
    expect(await res.getBody()).toEqual({
      success: true,
    });
  });

  it('can return response initializer from handler', async () => {
    monoCloudAuth();

    const api = protectApi(
      () =>
        ({
          body: '{"success": true }',
          headers: { 'content-type': 'application/json' },
        }) as unknown as NextResponse
    );

    const req = new NextRequest('http://localhost:3000/api/someroute');

    await setSessionCookie(req);

    const response = await api(req, { params: {} });

    const res = new TestAppRes(response);

    expect(res.status).toBe(200);
    expect(await res.getBody()).toEqual({
      success: true,
    });
  });
});
