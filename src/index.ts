export type {
  MonoCloudUser,
  MonoCloudSession,
} from '@monocloud/node-auth-core';

export type { AppRouterApiHandlerFn, ProtectPagePageReturnType } from './types';

export {
  monoCloudAuth,
  monoCloudMiddleware,
  getSession,
  getTokens,
  isAuthenticated,
  protectApi,
  protectPage,
} from './instance/initialize';
