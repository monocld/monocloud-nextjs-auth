export type {
  MonoCloudUser,
  MonoCloudSession,
} from '@monocloud/node-auth-core';

export {
  MonoCloudAuthBaseError,
  MonoCloudDiscoveryError,
  MonoCloudError,
  MonoCloudOPError,
} from '@monocloud/node-auth-core';

export type {
  AppRouterApiHandlerFn,
  ProtectPagePageReturnType,
  AppRouterContext,
} from './types';

export {
  monoCloudAuth,
  monoCloudMiddleware,
  getSession,
  getTokens,
  isAuthenticated,
  protectApi,
  protectPage,
  protect,
  isUserInGroup,
} from './instance/initialize';
