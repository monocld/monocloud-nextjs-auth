// @ts-expect-error This is a conditional import
// eslint-disable-next-line import/no-unresolved
import * as Components from '#components';

import type { ProtectedComponentProps } from '../types';

export const Protected =
  Components.Protected as React.FC<ProtectedComponentProps>;

export { SignIn } from './signin';
export { SignUp } from './signup';
export { SignOut } from './signout';
export { RedirectToSignIn } from './client/redirect-to-signin';
