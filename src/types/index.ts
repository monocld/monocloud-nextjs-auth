/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX } from 'react';
import type { MonoCloudUser } from '@monocloud/node-auth-core';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';
import type {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from 'next/server';
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ParsedUrlQuery } from 'node:querystring';

export interface AppRouterContext {
  params: Record<string, string | string[]>;
}

export type NextAnyRequest =
  | NextRequest
  | NextApiRequest
  | (IncomingMessage & {
      cookies: NextApiRequestCookies;
    });
export type NextAnyResponse =
  | NextApiResponse
  | AppRouterContext
  | NextResponse
  | ServerResponse;
export type NextAnyReturn = NextApiResponse | void;

/**
 * @param req - The Next.js request object.
 * @param error - Error occured during execution of the endpoint.
 * @returns A promise of the response or void
 */
type AppOnError = (
  req: NextRequest,
  error: Error
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param error - Error occured during execution of the endpoint.
 * @returns A promise of void
 */
type PageOnError = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: Error
) => Promise<void> | void;

/**
 * A function used to handle errors that occur during the signin, callback, signout and userinfo endpoint execution.
 *
 * `Note` - In the app router error handler, failing to return a `NextResponse` or throw an error will cause the request to hang. Same happens in the page router if you don't call `res.send()` or `res.json()` after you handle the error.
 */
type OnError = AppOnError | PageOnError;

/**
 * Options for `monoCloudAuth()`.
 */
export interface MonoCloudAuthOptions {
  /**
   * Error handler for signin, callback, signout and userinfo endpoints.
   */
  onError?: OnError;
}

/**
 * @typeparam Opts - The type of the additional options parameter (default: `any`).
 */
export type Handler<Opts = any> = {
  /**
   * @param req - The Next.js request object.
   * @param res - The AppRouterContext object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the response.
   */
  (req: NextRequest, res: AppRouterContext, options?: Opts): Promise<Response>;

  /**
   * @param req - The Next.js request object.
   * @param ctx - The NextResponse object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise.
   */
  (req: NextRequest, ctx: NextResponse, options?: Opts): Promise<void>;

  /**
   * @param req - The Next.js API request object.
   * @param res - The Next.js API response object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise.
   */
  (req: NextApiRequest, res: NextApiResponse, options?: Opts): Promise<void>;

  /**
   * @param req - The generic Next.js request object.
   * @param res - The generic Next.js response object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the the response.
   */
  (
    req: NextAnyRequest,
    res: NextAnyResponse,
    options?: Opts
  ): Promise<NextAnyReturn>;
} & BaseHandler;

export interface BaseHandler {
  /**
   * @param req - The Next.js request object.
   * @param res - The AppRouterContext object.
   * @returns A promise resolving to a response.
   */
  (req: NextRequest, res: AppRouterContext): Promise<Response>;

  /**
   * @param req - The Next.js request object.
   * @param ctx - The NextResponse object.
   * @returns A promise.
   */
  (req: NextRequest, ctx: NextResponse): Promise<void>;

  /**
   * @param req - The Next.js API request object.
   * @param res - The Next.js API response object.
   * @returns A promise.
   */
  (req: NextApiRequest, res: NextApiResponse): Promise<void>;

  /**
   * @param req - The generic Next.js request object.
   * @param res - The generic Next.js response object.
   * @returns A promise of the result.
   */
  (req: NextAnyRequest, res: NextAnyResponse): Promise<NextAnyReturn>;
}

/**
 * @typeparam TResult - The type of the result returned by the handler.
 */
export interface BaseFuncHandler<TResult> {
  /**
   * @param req - The Next.js request object.
   * @param ctx - The AppRouterContext or NextResponse object representing the response context.
   * @returns A promise of the result.
   */
  (req: NextRequest, ctx: AppRouterContext | NextResponse): Promise<TResult>;

  /**
   * @param req - The Next.js API request object.
   * @param res - The Next.js API response object.
   * @returns A promise of the result.
   */
  (req: NextApiRequest, res: NextApiResponse): Promise<TResult>;

  /**
   * @param req - The Next.js request object.
   * @param res - The Next.js response object.
   * @returns A promise of the result.
   */
  (req: NextAnyRequest, res: NextAnyResponse): Promise<TResult>;

  /**
   * @returns A promise of the result.
   */
  (): Promise<TResult>;
}

/**
 * @typeparam TResult - The type of the result returned by the function.
 * @typeparam TOptions - The type of the additional options parameter (default: `any`).
 */
export type FuncHandler<TResult, TOptions = any> = BaseFuncHandler<TResult> & {
  /**
   * @param req - The Next.js request object.
   * @param ctx - The context object, which can be either an AppRouterContext or a NextResponse.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the result.
   */
  (
    req: NextRequest,
    ctx: AppRouterContext | NextResponse,
    options?: TOptions
  ): Promise<TResult>;

  /**
   * @param req - The Next.js API request object.
   * @param res - The Next.js API response object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the result.
   */
  (
    req: NextApiRequest,
    res: NextApiResponse,
    options?: TOptions
  ): Promise<TResult>;

  /**
   * @param req - The generic Next.js request object.
   * @param res - The generic Next.js response object.
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the result.
   */
  (
    req: NextAnyRequest,
    res: NextAnyResponse,
    options?: TOptions
  ): Promise<TResult>;

  /**
   * @param options - Additional options passed to the function (optional).
   * @returns A promise of the result.
   */
  (options?: TOptions): Promise<TResult>;
};

type NextMiddlewareOnAccessDenied = (
  request: NextRequest,
  event: NextFetchEvent,
  user?: MonoCloudUser
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

/**
 * Options for configuring MonoCloud authentication middleware.
 */
export interface MonoCloudMiddlewareOptions {
  /**
   * Specifies the routes that require authentication.
   * This can be an array of strings or regular expressions representing protected routes,
   * or a function that returns a boolean indicating whether a request should be protected.
   */
  protectedRoutes?:
    | (
        | string
        | RegExp
        | {
            /**
             * Routes accessible by the users of specified groups
             */
            routes: (string | RegExp)[];
            /**
             * A list of group ids or group names that user should be a member of.
             */
            groups: string[];
          }
      )[]
    | ((req: NextRequest) => Promise<boolean> | boolean);

  /**
   * The name of the groups claim in the user profile. Default: `groups`.
   */
  groupsClaim?: string;

  /**
   * If true, user must be a member of all groups. Default: false.
   */
  matchAll?: boolean;

  /**
   * A middleware function called when the user is not authenticated or is not a member of the specified groups.
   */
  onAccessDenied?: NextMiddlewareOnAccessDenied;
}

/**
 * A middleware that protects pages and apis and handles authentication.
 * This middleware function can be configured with options or directly invoked with request and event parameters.
 */
export interface MonoCloudMiddleware {
  /**
   * A middleware that protects pages and apis and handles authentication.
   *
   * @param options - Options to configure the MonoCloud authentication middleware.
   * @returns A Next.js middleware function.
   */
  (options?: MonoCloudMiddlewareOptions): NextMiddleware;

  /**
   * A middleware that protects pages and apis and handles authentication.
   *
   * @returns A promise resolving to a Next.js middleware result or a Next.js middleware result.
   */
  (
    /**
     * The Next.js request object.
     */
    request: NextRequest,

    /**
     * The Next.js fetch event object.
     */
    event: NextFetchEvent
  ): Promise<NextMiddlewareResult> | NextMiddlewareResult;
}

export type AppRouterPageHandler = (props: {
  params?: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[] | undefined>;
}) => Promise<JSX.Element> | JSX.Element;

export type AppRouterApiHandlerFn = (
  req: NextRequest,
  res: AppRouterContext
) => Promise<Response> | Response;

export type ProtectAppPageOptions = {
  /**
   * The URL to return to after authentication.
   */
  returnUrl?: string;

  /**
   * Alternate page handler called when the user is not authenticated or is not a member of the specified groups.
   */
  onAccessDenied?: (props: {
    user?: MonoCloudUser;
    params?: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }) => Promise<JSX.Element> | JSX.Element;
} & GroupOptions;

export type ProtectPagePageOptions<
  P extends Record<string, any> = Record<string, any>,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
> = {
  /**
   * Function to fetch server-side props for the protected page handler.
   * If provided, this function will be called before rendering the protected page.
   *
   * @param context - The Next.js context object, including the request and response objects.
   * @returns Server-side props for the protected page.
   */
  getServerSideProps?: GetServerSideProps<P, Q>;

  /**
   * Specifies the URL to redirect to after authentication.
   */
  returnUrl?: string;

  /**
   * Alternate `getServerSideProps` function called when the user is not authenticated or is not a member of the specified groups.
   */
  onAccessDenied?: ProtectPagePageOnAccessDeniedType<P, Q>;
} & GroupOptions;

export type ProtectPagePageOnAccessDeniedType<
  P,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
> = (
  context: GetServerSidePropsContext<Q> & { user?: MonoCloudUser }
) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>;

export type ProtectPagePageReturnType<
  P,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
> = (
  context: GetServerSidePropsContext<Q>
) => Promise<GetServerSidePropsResult<P & { user: MonoCloudUser }>>;

/**
 * Type definition for protecting a server rendered page handler function.
 * This type takes optional protection options and returns the protected page handler.
 *
 * @typeparam P - The type of parameters accepted by the page handler.
 * @typeparam Q - The type of query parameters parsed from the URL.
 * @returns Protected page handler function.
 */
export type ProtectPagePage = <
  P extends Record<string, any> = Record<string, any>,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
>(
  /**
   * Protection options
   */
  options?: ProtectPagePageOptions<P, Q>
) => ProtectPagePageReturnType<P, Q>;

/**
 * Type definition for protecting a server rendered AppRouter page handler function.
 *
 * @returns Protected page handler function.
 */
export type ProtectAppPage = (
  /**
   * The page handler function to protect
   */
  handler: (props: {
    user: MonoCloudUser;
    params?: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }) => Promise<JSX.Element> | JSX.Element,

  /**
   * Protection options
   */
  options?: ProtectAppPageOptions
) => AppRouterPageHandler;

/**
 * Protects a server rendered page.
 */
export type ProtectPage = ProtectAppPage & ProtectPagePage;

export type AppRouterApiOnAccessDeniedHandlerFn = (
  req: NextRequest,
  res: AppRouterContext,
  user?: MonoCloudUser
) => Promise<Response> | Response;

export type ProtectAppApi = (
  req: NextRequest,
  ctx: AppRouterContext,
  handler: AppRouterApiHandlerFn,
  options?: {
    /**
     * Alternate app router api handler called when the user is not authenticated or is not a member of the specified groups.
     */
    onAccessDenied?: AppRouterApiOnAccessDeniedHandlerFn;
  } & GroupOptions
) => Promise<Response> | Response;

export type NextPageRouterApiOnAccessDeniedHandler = (
  req: NextApiRequest,
  res: NextApiResponse<any>,
  user?: MonoCloudUser
) => unknown | Promise<unknown>;

export type ProtectPageApi = (
  req: NextApiRequest,
  res: NextApiResponse,
  handler: NextApiHandler,
  options?: {
    /**
     * Alternate page router api handler called when the user is not authenticated or is not a member of the specified groups.
     */
    onAccessDenied?: NextPageRouterApiOnAccessDeniedHandler;
  } & GroupOptions
) => Promise<unknown>;

type ProtectApiPage = (
  /**
   * The api route handler function to protect
   */
  handler: NextApiHandler,

  options?: {
    /**
     * Alternate page router api handler called when the user is not authenticated or is not a member of the specified groups.
     */
    onAccessDenied?: NextPageRouterApiOnAccessDeniedHandler;
  } & GroupOptions
) => NextApiHandler;

type ProtectApiApp = (
  /**
   * The api route handler function to protect
   */
  handler: AppRouterApiHandlerFn,

  options?: {
    /**
     * Alternate app router api handler called when the user is not authenticated or is not a member of the specified groups.
     */
    onAccessDenied?: AppRouterApiOnAccessDeniedHandlerFn;
  } & GroupOptions
) => AppRouterApiHandlerFn;

/**
 * Protects an api route handler.
 */
export type ProtectApi = ProtectApiApp & ProtectApiPage;

export type ProtectOptions = {
  /**
   * The url where the user will be redirected to after sign in.
   */
  returnUrl?: string;
} & GroupOptions;

/**
 * Redirects user to sign in page if not already authenticated.
 *
 * @param options - The Protect options
 */
export type Protect = (options?: ProtectOptions) => Promise<void>;

/**
 * Props for the `<RedirectToSignIn />` Component
 */
export interface RedirectToSignInProps {
  /**
   * The url where the user will be redirected to after sign in.
   */
  returnUrl?: string;
}

export interface ProtectedComponentProps {
  /**
   * Components that should be rendered if the user is authenticated.
   */
  children: React.ReactNode;

  /**
   * A list of group names or IDs to which the user must belong to. The user should belong to atleast one of the specified groups.
   */
  groups?: string[];

  /**
   * Name of the claim of user's groups. default: `groups`.
   */
  groupsClaim?: string;

  /**
   * Flag indicating if all groups specified should be present in the users profile. default: false.
   */
  matchAllGroups?: boolean;

  /**
   * A fallback component that should render if the user is not authenticated.
   */
  onAccessDenied?: React.ReactNode;
}

export interface IsUserInGroupOptions {
  /**
   * The name of the groups claim in the user profile. Default: `groups`.
   */
  groupsClaim?: string;

  /**
   * If true, user must be a member of all groups. Default: false.
   */
  matchAll?: boolean;
}

export interface GroupOptions extends IsUserInGroupOptions {
  /**
   * A list of group ids or group names that user should be a member of.
   */
  groups?: string[];
}

/**
 * @typeparam TResult - The type of the result returned by the function.
 * @typeparam TOptions - The type of the additional options parameter (default: `any`).
 */
export interface IsUserInGroupHandler {
  /**
   * @param req - The Next.js request object.
   * @param ctx - The context object, which can be either an AppRouterContext or a NextResponse.
   * @param groups - A list of group ids or group names that user should be a member of.
   * @param options - Additional options passed to the function.
   * @returns A promise of the result.
   */
  (
    req: NextRequest,
    ctx: AppRouterContext | NextResponse,
    groups: string[],
    options?: IsUserInGroupOptions
  ): Promise<boolean>;

  /**
   * @param req - The Next.js API request object.
   * @param res - The Next.js API response object.
   * @param groups - A list of group ids or group names that user should be a member of.
   * @param options - Additional options passed to the function.
   * @returns A promise of the result.
   */
  (
    req: NextApiRequest,
    res: NextApiResponse,
    groups: string[],
    options?: IsUserInGroupOptions
  ): Promise<boolean>;

  /**
   * @param req - The generic Next.js request object.
   * @param res - The generic Next.js response object.
   * @param groups - A list of group ids or group names that user should be a member of.
   * @param options - Additional options passed to the function.
   * @returns A promise of the result.
   */
  (
    req: NextAnyRequest,
    res: NextAnyResponse,
    groups: string[],
    options?: IsUserInGroupOptions
  ): Promise<boolean>;

  /**
   * @param groups - A list of group ids or group names that user should be a member of.
   * @param options - Additional options passed to the function.
   * @returns A promise of the result.
   */
  (groups: string[], options?: IsUserInGroupOptions): Promise<boolean>;
}
