/* eslint-disable import/no-extraneous-dependencies */
import 'url-search-params-polyfill';
import { render } from '@testing-library/react';
import React from 'react';
import { SignOut } from '../../src/client/signout';

describe('<SignOut/> - Base Path', () => {
  it('should pickup base path from __NEXT_ROUTER_BASEPATH', () => {
    // eslint-disable-next-line no-underscore-dangle
    process.env.__NEXT_ROUTER_BASEPATH = '/test';

    const { container } = render(<SignOut>Sign Out</SignOut>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(href).toBe('/test/api/auth/signout');
  });
});
