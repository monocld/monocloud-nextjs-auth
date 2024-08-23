import { NextRequest, NextResponse } from 'next/server';
import { monoCloudAuth, protectApi } from '../../../src';
import {
  TestAppRes,
  defaultSessionCookieValue,
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';

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

  describe('groups', () => {
    it('should allow access to api if user belongs to any of the listed groups', async () => {
      monoCloudAuth();

      const api = protectApi(
        () =>
          ({
            body: '{"success": true }',
            headers: { 'content-type': 'application/json' },
          }) as unknown as NextResponse,
        { groups: ['test'] }
      );

      const req = new NextRequest('http://localhost:3000/api/someroute');

      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const response = await api(req, { params: {} });

      const res = new TestAppRes(response);

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        success: true,
      });
    });

    it('can customize the groups claim', async () => {
      monoCloudAuth();

      const api = protectApi(
        () =>
          ({
            body: '{"success": true }',
            headers: { 'content-type': 'application/json' },
          }) as unknown as NextResponse,
        { groups: ['test'], groupsClaim: 'CUSTOM_GROUPS' }
      );

      const req = new NextRequest('http://localhost:3000/api/someroute');

      await setSessionCookie(req, undefined, {
        ...defaultSessionCookieValue,
        user: { ...defaultSessionCookieValue.user, CUSTOM_GROUPS: ['test'] },
      });

      const response = await api(req, { params: {} });

      const res = new TestAppRes(response);

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        success: true,
      });
    });

    it('should not allow access to api if user does not belongs to any of the listed groups', async () => {
      monoCloudAuth();

      const api = protectApi(
        () =>
          ({
            body: '{"success": true }',
            headers: { 'content-type': 'application/json' },
          }) as unknown as NextResponse,
        { groups: ['NOPE'] }
      );

      const req = new NextRequest('http://localhost:3000/api/someroute');

      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const response = await api(req, { params: {} });

      const res = new TestAppRes(response);

      expect(res.status).toBe(403);
      expect(await res.getBody()).toEqual({
        message: 'forbidden',
      });
    });

    it('can set custom onAccessDenied handler', async () => {
      monoCloudAuth();

      const api = protectApi(
        () =>
          ({
            body: '{"success": true }',
            headers: { 'content-type': 'application/json' },
          }) as unknown as NextResponse,
        {
          groups: ['NOPE'],
          onAccessDenied: () => NextResponse.json({ custom: true }),
        }
      );

      const req = new NextRequest('http://localhost:3000/api/someroute');

      await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);

      const response = await api(req, { params: {} });

      const res = new TestAppRes(response);

      expect(res.status).toBe(200);
      expect(await res.getBody()).toEqual({
        custom: true,
      });
    });
  });
});
