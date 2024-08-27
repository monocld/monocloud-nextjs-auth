import { NextRequest, NextResponse } from 'next/server';
import { MonoCloudValidationError } from '@monocloud/node-auth-core';
import { isUserInGroup, monoCloudAuth } from '../../../src';
import {
  defaultSessionCookieValue,
  setSessionCookie,
} from '../../common-helper';

describe('isUserInGroup() - App Router', () => {
  let req: NextRequest;

  beforeEach(async () => {
    req = new NextRequest('http://localhost:3000/');

    monoCloudAuth();

    await setSessionCookie(req, undefined, {
      ...defaultSessionCookieValue,
      user: {
        ...defaultSessionCookieValue.user,
        groups: ['test'],
        CUSTOM_GROUPS: ['test'],
      },
    });
  });

  afterEach(() => {
    req = undefined as unknown as NextRequest;
  });

  describe('No params (<From Cookies>)', () => {
    beforeEach(() => {
      jest.mock('next/headers', () => {
        const headers = jest.requireActual('next/headers');
        return {
          ...headers,
          cookies: () => ({
            ...headers.cookies,
            get: (name: string) => req.cookies.get(name),
            getAll: () => req.cookies.getAll(),
          }),
        };
      });
    });

    it('should return true if the user is in any of the specified groups', async () => {
      const result = await isUserInGroup(['test']);

      expect(result).toBe(true);
    });

    it('should return false if the user is not in the specified groups', async () => {
      const result = await isUserInGroup(['NOPE']);

      expect(result).toBe(false);
    });

    it('can customize groups claim', async () => {
      const result = await isUserInGroup(['test'], {
        groupsClaim: 'CUSTOM_GROUPS',
      });

      expect(result).toBe(true);
    });
  });

  describe('With Request and Response (req, res)', () => {
    it('should return true if the user is in any of the specified groups', async () => {
      const res = new NextResponse();

      const result = await isUserInGroup(req, res, ['test']);

      expect(result).toBe(true);
    });

    it('should return false if the user is not in any of the specified groups', async () => {
      const res = new NextResponse();

      const result = await isUserInGroup(req, res, ['NOPE']);

      expect(result).toBe(false);
    });

    it('can customize groups claim', async () => {
      const res = new NextResponse();

      const result = await isUserInGroup(req, res, ['test'], {
        groupsClaim: 'CUSTOM_GROUPS',
      });

      expect(result).toBe(true);
    });
  });

  describe('With Request and Context (req, ctx)', () => {
    it('should return true if the user is in any of the specified groups', async () => {
      const result = await isUserInGroup(req, { params: {} }, ['test']);

      expect(result).toBe(true);
    });

    it('should return false if the user is not in any of the specified groups', async () => {
      const result = await isUserInGroup(req, { params: {} }, ['NOPE']);

      expect(result).toBe(false);
    });

    it('can customize the groups claim', async () => {
      const result = await isUserInGroup(req, { params: {} }, ['test'], {
        groupsClaim: 'CUSTOM_GROUPS',
      });

      expect(result).toBe(true);
    });
  });
});

describe('isUserInGroup() - App Router (No session + No groups)', () => {
  let req: NextRequest;

  beforeEach(() => {
    req = new NextRequest('http://localhost:3000/');

    monoCloudAuth();
  });

  afterEach(() => {
    req = undefined as unknown as NextRequest;
  });

  describe('No params (<From Cookies>)', () => {
    beforeEach(() => {
      jest.mock('next/headers', () => {
        const headers = jest.requireActual('next/headers');
        return {
          ...headers,
          cookies: () => ({
            ...headers.cookies,
            get: (name: string) => req.cookies.get(name),
            getAll: () => req.cookies.getAll(),
          }),
        };
      });
    });

    it('should return false if there is no session', async () => {
      const result = await isUserInGroup(['test']);

      expect(result).toBe(false);
    });

    it('should throw if no groups are passed', async () => {
      try {
        await isUserInGroup(null as unknown as string[]);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudValidationError);
        expect(error.message).toBe(
          'Invalid parameters passed to isUserInGroup()'
        );
      }
    });

    it('can customize', async () => {});
  });

  describe('With Request and Response (req, res)', () => {
    it('should return false if there is no session', async () => {
      const res = new NextResponse();

      const result = await isUserInGroup(req, res, ['test']);

      expect(result).toBe(false);
    });

    it('should throw if no groups are passed', async () => {
      try {
        await isUserInGroup(
          req,
          new NextResponse(),
          null as unknown as string[]
        );
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudValidationError);
        expect(error.message).toBe(
          'Invalid parameters passed to isUserInGroup()'
        );
      }
    });
  });

  describe('With Request and Context (req, ctx)', () => {
    it('should return false if there is no session', async () => {
      const result = await isUserInGroup(req, { params: {} }, ['test']);

      expect(result).toBe(false);
    });

    it('should throw if no groups are passed', async () => {
      try {
        await isUserInGroup(req, { params: {} }, null as unknown as string[]);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudValidationError);
        expect(error.message).toBe(
          'Invalid parameters passed to isUserInGroup()'
        );
      }
    });
  });
});
