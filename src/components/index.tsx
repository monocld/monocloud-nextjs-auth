// @ts-expect-error This is a conditional import
import * as Components from '#components';

import type { ProtectedComponent } from '../types';

export const Protected = Components.Protected as ProtectedComponent;
export { SignIn } from './signin';
export { SignUp } from './signup';
export { SignOut } from './signout';
export { RedirectToSignIn } from './client/redirect-to-signin';
