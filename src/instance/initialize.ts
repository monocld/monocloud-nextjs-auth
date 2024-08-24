/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  MonoCloudSession,
  MonoCloudTokens,
} from '@monocloud/node-auth-core';
import MonoCloudInstance from './monocloud-instance';
import {
  BaseFuncHandler,
  FuncHandler,
  MonoCloudMiddleware,
  ProtectApi,
  ProtectPage,
  RedirectToSignIn,
  MonoCloudAuthOptions,
} from '../types';

let instance: MonoCloudInstance;

const getInstance = () => {
  if (!instance) {
    instance = new MonoCloudInstance({
      userAgent: 'monocloud/nextjs-auth',
      debugger: 'monocloud:nextjs-auth',
    });
  }

  return instance;
};

/**
 * Api middleware function for handling authentication routes.
 * It checks incoming requests against predefined authentication routes
 * and calls corresponding handler functions.
 *
 * @param options - Options to customize authentication handlers.
 *
 */
export const monoCloudAuth = (options?: MonoCloudAuthOptions) =>
  getInstance().monoCloudAuth(options);

/**
 * A middleware that protects pages and apis and handles authentication.
 */
export const monoCloudMiddleware: MonoCloudMiddleware = (
  ...args: unknown[]
): any => getInstance().monoCloudMiddleware(...(args as any));

/**
 * Retrieves the session data associated with the current user.
 *
 */
export const getSession: BaseFuncHandler<MonoCloudSession | undefined> = (
  ...args: unknown[]
) =>
  getInstance().getSession(
    ...(args as Parameters<BaseFuncHandler<MonoCloudSession | undefined>>)
  );

/**
 * Retrieves the tokens associated with the current session.
 *
 */
export const getTokens: FuncHandler<MonoCloudTokens> = (...args: unknown[]) =>
  getInstance().getTokens(...(args as any));

/**
 * Checks if the current user is authenticated.
 *
 */
export const isAuthenticated: BaseFuncHandler<boolean> = (...args: unknown[]) =>
  getInstance().isAuthenticated(
    ...(args as Parameters<BaseFuncHandler<boolean>>)
  );

/**
 * Redirects the user to sign-in if not authenticated.
 * **Note: This function only works on App Router.**
 */
export const redirectToSignIn: RedirectToSignIn = (returnUrl?: string) =>
  getInstance().redirectToSignIn(returnUrl);

/**
 * Protects an API handler.
 *
 * @param handler - API handler function.
 * @returns Protected API handler function.
 */
export const protectApi: ProtectApi = handler =>
  getInstance().protectApi(handler as any) as any;

/**
 * Protects a server rendered page.
 */
export const protectPage: ProtectPage = (...args: unknown[]) =>
  getInstance().protectPage(...(args as any)) as any;
