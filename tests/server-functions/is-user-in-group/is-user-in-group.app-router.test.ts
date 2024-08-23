import { NextRequest, NextResponse } from 'next/server';
import { isUserInGroup, monoCloudAuth, MonoCloudError } from '../../../src';
import {
  setSessionCookie,
  userWithGroupsSessionCookieValue,
} from '../../common-helper';

describe('isUserInGroup() - App Router', () => {
  let req: NextRequest;

  beforeEach(async () => {
    req = new NextRequest('http://localhost:3000/');

    monoCloudAuth();

    await setSessionCookie(req, undefined, userWithGroupsSessionCookieValue);
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
  });
});

describe('isUserInGroup() - App Router (No session + No group options)', () => {
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

    it('should throw if no options are passed', async () => {
      try {
        await isUserInGroup(null as unknown as string[]);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudError);
        expect(error.message).toBe(
          'isUserInGroup() - groups should be an array'
        );
      }
    });
  });

  describe('With Request and Response (req, res)', () => {
    it('should return false if there is no session', async () => {
      const res = new NextResponse();

      const result = await isUserInGroup(req, res, ['test']);

      expect(result).toBe(false);
    });

    it('should throw if no options are passed', async () => {
      try {
        await isUserInGroup(
          req,
          new NextResponse(),
          null as unknown as string[]
        );
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudError);
        expect(error.message).toBe(
          'isUserInGroup() - groups should be an array'
        );
      }
    });
  });

  describe('With Request and Context (req, ctx)', () => {
    it('should return false if there is no session', async () => {
      const result = await isUserInGroup(req, { params: {} }, ['test']);

      expect(result).toBe(false);
    });

    it('should throw if no options are passed', async () => {
      try {
        await isUserInGroup(req, { params: {} }, null as unknown as string[]);
        throw new Error();
      } catch (error) {
        expect(error).toBeInstanceOf(MonoCloudError);
        expect(error.message).toBe(
          'isUserInGroup() - groups should be an array'
        );
      }
    });
  });
});
