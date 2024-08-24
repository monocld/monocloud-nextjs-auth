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

export {
  monoCloudAuth,
  monoCloudMiddleware,
  getSession,
  getTokens,
  isAuthenticated,
  protectApi,
  protectPage,
  redirectToSignIn,
} from './instance/initialize';
