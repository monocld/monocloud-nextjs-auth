/* eslint-disable import/no-extraneous-dependencies */
import 'url-search-params-polyfill';
import { render } from '@testing-library/react';
import React from 'react';
import { SignUp } from '../../src/components/signup';

describe('<SignUp/> - NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL', () => {
  it('should pickup the custom auth endpoint set through the env', () => {
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_SIGN_IN_URL = '/test';

    const { container } = render(<SignUp>Sign Up</SignUp>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(href).toBe('/test?register=true');
  });
});
