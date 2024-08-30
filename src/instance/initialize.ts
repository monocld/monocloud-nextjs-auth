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
  Protect,
  MonoCloudAuthOptions,
  IsUserInGroupHandler,
} from '../types';

let instance: MonoCloudInstance;

const getInstance = () => {
  if (!instance) {
    instance = new MonoCloudInstance({
      // eslint-disable-next-line prefer-template
      userAgent: SDK_NAME + '@' + SDK_VERSION,
      debugger: SDK_DEBUGGER_NAME,
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
export const protect: Protect = options => getInstance().protect(options);

/**
 * Protects an API handler.
 *
 * @param handler - API handler function.
 * @returns Protected API handler function.
 */
export const protectApi: ProtectApi = (handler, options) =>
  getInstance().protectApi(handler as any, options as any) as any;

/**
 * Protects a server rendered page.
 */
export const protectPage: ProtectPage = (...args: unknown[]) =>
  getInstance().protectPage(...(args as any)) as any;

/**
 * Checks if the user belongs to any one of the groups specified.
 */
export const isUserInGroup: IsUserInGroupHandler = (...args: unknown[]) =>
  getInstance().isUserInGroup(...(args as Parameters<IsUserInGroupHandler>));
