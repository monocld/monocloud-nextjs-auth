/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import type {
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next/types';
import type {
  CallbackOptions,
  IMonoCloudCookieRequest,
  IMonoCloudCookieResponse,
  SignInOptions,
  MonoCloudOptions,
  UserInfoOptions,
  MonoCloudSession,
  SignOutOptions,
  MonoCloudTokens,
  GetTokensOptions,
} from '@monocloud/node-auth-core';
import {
  MonoCloudBaseInstance,
  isAbsoluteUrl,
  ensureLeadingSlash,
} from '@monocloud/node-auth-core';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';
import {
  AppRouterContext,
  MonoCloudMiddlewareOptions,
  BaseFuncHandler,
  FuncHandler,
  MonoCloudMiddleware,
  NextAnyRequest,
  NextAnyResponse,
  ProtectAppPageOptions,
  ProtectPagePageReturnType,
  AppRouterPageHandler,
  ProtectAppPage,
  ProtectPagePage,
  AppRouterApiHandlerFn,
  ProtectPage,
  ProtectAppApi,
  ProtectPageApi,
  ProtectApi,
} from '../types';
import { isAppRouter, getMonoCloudReqRes, mergeResponse } from '../utils';
import MonoCloudCookieRequest from '../requests/monocloud-cookie-request';
import MonoCloudCookieResponse from '../responses/monocloud-cookie-response';

export default class MonoCloudInstance {
  private readonly baseInstance: MonoCloudBaseInstance;

  constructor(options?: MonoCloudOptions) {
    this.registerPublicEnvVariables();
    this.baseInstance = new MonoCloudBaseInstance(options);
  }

  /**
   * Api middleware function for handling authentication routes.
   * It checks incoming requests against predefined authentication routes
   * and calls corresponding handler functions.
   */
  public monoCloudAuth(): any {
    return (req: NextAnyRequest, resOrCtx: NextAnyResponse) => {
      const { response } = getMonoCloudReqRes(req, resOrCtx);

      const { routes, appUrl } = this.getOptions();

      let { url = '' } = req;

      if (!isAbsoluteUrl(url)) {
        url = new URL(url, appUrl).toString();
      }

      const route = new URL(url);

      switch (route.pathname) {
        case ensureLeadingSlash(routes.signIn):
          return this.resolvedSignInHandler(req, resOrCtx);

        case ensureLeadingSlash(routes.callback):
          return this.resolvedCallbackHandler(req, resOrCtx);

        case ensureLeadingSlash(routes.userInfo):
          return this.resolvedUserInfoHandler(req, resOrCtx);

        case ensureLeadingSlash(routes.signOut):
          return this.resolvedSignOutHandler(req, resOrCtx);

        default:
          response.notFound();
          return response.done();
      }
    };
  }

  /**
   * Protects a server rendered page.
   */
  public protectPage: ProtectPage = (...args: unknown[]) => {
    if (typeof args[0] === 'function') {
      return this.protectAppPage(
        args[0] as AppRouterPageHandler,
        args[1] as ProtectAppPageOptions
      ) as any;
    }

    return this.protectPagePage(
      args[0] as ProtectAppPageOptions
    ) as ProtectPagePageReturnType<any, any>;
  };

  private protectAppPage: ProtectAppPage = (handler, options) => {
    return async params => {
      const session = await this.getSession();

      if (!session) {
        const { routes, appUrl } = this.getOptions();

        const { headers } = require('next/headers');
        const path = headers().get('x-monocloud-path');

        const signInRoute = new URL(
          `${appUrl}${ensureLeadingSlash(routes.signIn)}`
        );

        signInRoute.searchParams.set(
          'return_url',
          options?.returnUrl ?? path ?? '/'
        );

        const { redirect } = require('next/navigation');
        return redirect(signInRoute);
      }

      return handler({ ...params, user: session.user });
    };
  };

  private protectPagePage: ProtectPagePage = options => {
    return async context => {
      const session = await this.getSession(
        context.req as any,
        context.res as any
      );

      if (!session) {
        const { routes, appUrl } = this.getOptions();

        const signInRoute = new URL(
          `${appUrl}${ensureLeadingSlash(routes.signIn)}`
        );

        signInRoute.searchParams.set(
          'return_url',
          options?.returnUrl ?? context.resolvedUrl
        );

        return {
          redirect: {
            destination: signInRoute.toString(),
            permanent: false,
          },
        };
      }

      const customProps: any = options?.getServerSideProps
        ? await options.getServerSideProps(context)
        : {};

      if (customProps.props instanceof Promise) {
        return {
          ...customProps,
          props: customProps.props.then((props: any) => ({
            user: session.user,
            ...props,
          })),
        };
      }

      return {
        ...customProps,
        props: { user: session.user, ...customProps.props },
      };
    };
  };

  /**
   * Protects an api route handler.
   */
  public protectApi: ProtectApi = handler => {
    return (req, resOrCtx) => {
      if (isAppRouter(req)) {
        return this.protectAppApi(
          req as NextRequest,
          resOrCtx as AppRouterContext,
          handler as AppRouterApiHandlerFn
        ) as any;
      }
      return this.protectPageApi(
        req as NextApiRequest,
        resOrCtx as NextApiResponse,
        handler as NextApiHandler
      ) as any;
    };
  };

  private protectAppApi: ProtectAppApi = async (req, ctx, handler) => {
    const res = new NextResponse();

    const session = await this.getSession(req, res);

    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    const resp = await handler(req, ctx);

    if (resp instanceof NextResponse) {
      return mergeResponse([res, resp]);
    }

    return mergeResponse([res, new NextResponse(resp.body, resp)]);
  };

  private protectPageApi: ProtectPageApi = async (req, res, handler) => {
    const session = await this.getSession(req, res);

    if (!session) {
      return res.status(401).json({
        message: 'unauthorized',
      });
    }

    return handler(req, res);
  };

  /**
   * A middleware that protects pages and apis and handles authentication.
   */
  public monoCloudMiddleware: MonoCloudMiddleware = (...args: unknown[]) => {
    let req: NextRequest | undefined;
    let evt: NextFetchEvent | undefined;
    let options: MonoCloudMiddlewareOptions | undefined;

    if (Array.isArray(args)) {
      if (args.length === 2) {
        if (isAppRouter(args[0] as NextAnyRequest)) {
          req = args[0] as NextRequest;
          evt = args[1] as NextFetchEvent;
        }
      }

      if (args.length === 1) {
        options = args[0] as MonoCloudMiddlewareOptions;
      }
    }

    if (req && evt) {
      return this.authMiddlewareHandler(req, evt, options) as any;
    }

    return (request: NextRequest, nxtEvt: NextFetchEvent) => {
      return this.authMiddlewareHandler(request, nxtEvt, options);
    };
  };

  private async authMiddlewareHandler(
    req: NextRequest,
    _evt: NextFetchEvent,
    options?: MonoCloudMiddlewareOptions
  ): Promise<NextMiddlewareResult> {
    const { routes, appUrl } = this.getOptions();

    if (
      Object.values(routes)
        .map(x => ensureLeadingSlash(x))
        .includes(req.nextUrl.pathname)
    ) {
      return NextResponse.next();
    }

    const nxtResp = new NextResponse();

    nxtResp.headers.set(
      'x-monocloud-path',
      req.nextUrl.pathname + req.nextUrl.search
    );

    let isRouteProtected = true;

    if (typeof options?.protectedRoutes === 'function') {
      isRouteProtected = await options.protectedRoutes(req);
    } else if (
      typeof options?.protectedRoutes !== 'undefined' &&
      Array.isArray(options.protectedRoutes)
    ) {
      isRouteProtected = options.protectedRoutes.some(route =>
        new RegExp(route).test(req.nextUrl.pathname)
      );
    }

    if (!isRouteProtected) {
      return NextResponse.next({
        headers: {
          'x-monocloud-path': req.nextUrl.pathname + req.nextUrl.search,
        },
      });
    }

    const session = await this.getSession(req, nxtResp);

    if (!session) {
      if (req.nextUrl.pathname.startsWith('/api')) {
        return mergeResponse([
          nxtResp,
          NextResponse.json({ message: 'unauthorized' }, { status: 401 }),
        ]);
      }

      const signInRoute = new URL(
        `${appUrl}${ensureLeadingSlash(routes.signIn)}`
      );
      signInRoute.searchParams.set(
        'return_url',
        req.nextUrl.pathname + req.nextUrl.search
      );
      return mergeResponse([nxtResp, NextResponse.redirect(signInRoute)]);
    }

    return NextResponse.next(nxtResp);
  }

  /**
   * Retrieves the session data associated with the current user.
   *
   */
  public getSession: BaseFuncHandler<MonoCloudSession | undefined> =
    this.resolveFunction<MonoCloudSession | undefined>(
      this.resolvedGetSession.bind(this)
    );

  /**
   * Retrieves the tokens associated with the current session.
   *
   */
  public getTokens: FuncHandler<MonoCloudTokens, GetTokensOptions> =
    this.resolveFunction<MonoCloudTokens, GetTokensOptions>(
      this.resolvedGetTokens.bind(this)
    );

  /**
   * Checks if the current user is authenticated.
   *
   */
  public isAuthenticated: BaseFuncHandler<boolean> =
    this.resolveFunction<boolean>(this.resolvedIsAuthenticated.bind(this));

  /**
   * Redirects the user to sign-in if not authenticated.
   * **Note: This function only works on App Router.**
   */
  public async redirectToSignIn(returnUrl?: string): Promise<void> {
    const { routes, appUrl } = this.baseInstance.getOptions();
    let path;
    try {
      const session = await this.getSession();

      if (session) {
        return;
      }

      const { headers } = require('next/headers');
      path = headers().get('x-monocloud-path') ?? '/';
    } catch (error) {
      throw new Error(
        'redirectToSignIn() can only be used in App Router project'
      );
    }

    const { redirect } = require('next/navigation');

    redirect(
      `${appUrl}${routes.signIn}?return_url=${encodeURIComponent(returnUrl?.trim().length ? returnUrl : path)}`
    );
  }

  private resolveFunction<TResult, TOptions = any>(
    baseHandler: (
      req?: NextAnyRequest,
      resOrCtx?: NextAnyResponse,
      options?: TOptions
    ) => Promise<TResult>
  ): FuncHandler<TResult, TOptions> {
    return ((...args) => {
      if (args.length === 3) {
        const req = args[0] as NextApiRequest | NextRequest;
        const res = args[1] as NextApiResponse | AppRouterContext;
        const options = args[2] as TOptions;
        return baseHandler(req, res, options);
      }

      if (args.length === 2) {
        const req = args[0] as NextApiRequest | NextRequest;
        const res = args[1] as NextApiResponse | AppRouterContext;
        return baseHandler(req, res);
      }

      if (args.length === 1) {
        const options = args[0] as TOptions;
        return baseHandler(undefined, undefined, options);
      }

      return baseHandler();
    }) as FuncHandler<TResult, TOptions>;
  }

  private resolvedSignInHandler(
    req: NextAnyRequest,
    resOrCtx: NextAnyResponse,
    options?: SignInOptions
  ): Promise<NextApiResponse | void> {
    const { request, response } = getMonoCloudReqRes(req, resOrCtx);
    return this.baseInstance.signIn(request, response, options);
  }

  private resolvedCallbackHandler(
    req: NextAnyRequest,
    resOrCtx: NextAnyResponse,
    options?: CallbackOptions
  ): Promise<NextApiResponse | void> {
    const { request, response } = getMonoCloudReqRes(req, resOrCtx);
    return this.baseInstance.callback(request, response, options);
  }

  private resolvedUserInfoHandler(
    req: NextAnyRequest,
    resOrCtx: NextAnyResponse,
    options?: UserInfoOptions
  ): Promise<NextApiResponse | void> {
    const { request, response } = getMonoCloudReqRes(req, resOrCtx);
    return this.baseInstance.userInfo(request, response, options);
  }

  private resolvedSignOutHandler(
    req: NextAnyRequest,
    resOrCtx: NextAnyResponse,
    options?: SignOutOptions
  ): Promise<NextApiResponse | void> {
    const { request, response } = getMonoCloudReqRes(req, resOrCtx);
    return this.baseInstance.signOut(request, response, options);
  }

  private resolvedGetSession(
    req?: NextAnyRequest,
    resOrCtx?: NextAnyResponse
  ): Promise<MonoCloudSession | undefined> {
    let request: IMonoCloudCookieRequest;
    let response: IMonoCloudCookieResponse;

    if (req && resOrCtx) {
      const result = getMonoCloudReqRes(req, resOrCtx);
      request = result.request;
      response = result.response;
    } else {
      request = new MonoCloudCookieRequest();
      response = new MonoCloudCookieResponse();
    }

    return this.baseInstance.getSession(request, response);
  }

  private resolvedGetTokens(
    req?: NextAnyRequest,
    resOrCtx?: NextAnyResponse,
    options?: GetTokensOptions
  ): Promise<MonoCloudTokens> {
    let request: IMonoCloudCookieRequest;
    let response: IMonoCloudCookieResponse;

    if (req && resOrCtx) {
      const result = getMonoCloudReqRes(req, resOrCtx);
      request = result.request;
      response = result.response;
    } else {
      request = new MonoCloudCookieRequest();
      response = new MonoCloudCookieResponse();
    }

    return this.baseInstance.getTokens(request, response, options);
  }

  private resolvedIsAuthenticated(
    req?: NextAnyRequest,
    resOrCtx?: NextAnyResponse
  ): Promise<boolean> {
    let request: IMonoCloudCookieRequest;
    let response: IMonoCloudCookieResponse;

    if (req && resOrCtx) {
      const result = getMonoCloudReqRes(req, resOrCtx);
      request = result.request;
      response = result.response;
    } else {
      request = new MonoCloudCookieRequest();
      response = new MonoCloudCookieResponse();
    }

    return this.baseInstance.isAuthenticated(request, response);
  }

  private getOptions() {
    return this.baseInstance.getOptions();
  }

  private registerPublicEnvVariables() {
    Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_MONOCLOUD_AUTH'))
      .forEach(publicKey => {
        const privateKey = publicKey.split('NEXT_PUBLIC_')[1];
        process.env[privateKey] = process.env[publicKey];
      });
  }
}
