/* eslint-disable import/no-extraneous-dependencies */
import 'url-search-params-polyfill';
import { render } from '@testing-library/react';
import React from 'react';
import { SignIn, SignOut, SignUp } from '../../src/client';

describe('<SignIn/>', () => {
  it('should a link to signin endpoint', () => {
    const { container } = render(<SignIn>Sign In</SignIn>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe('/api/auth/signin');
    expect(anchor.text).toBe('Sign In');
  });

  it('can set returnUrl, authenticator and loginHint through props', () => {
    const { container } = render(
      <SignIn authenticator="google" returnUrl="/test" loginHint="username">
        Sign In
      </SignIn>
    );
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe(
      '/api/auth/signin?authenticator_hint=google&login_hint=username&return_url=%2Ftest'
    );
    expect(anchor.text).toBe('Sign In');
  });

  it('can set arbitrary props', () => {
    const { container } = render(
      <SignIn {...{ test: 1, custom: 'prop' }}>Sign In</SignIn>
    );
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');
    const testAttribute = anchor.getAttribute('test');
    const customAtrribute = anchor.getAttribute('custom');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(3);
    expect(href).toBe('/api/auth/signin');
    expect(testAttribute).toBe('1');
    expect(customAtrribute).toBe('prop');
    expect(anchor.text).toBe('Sign In');
  });
});

describe('<SignUp/>', () => {
  it('should render a link to signin endpoint with register query param set to true', () => {
    const { container } = render(<SignUp>Sign Up</SignUp>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe('/api/auth/signin?register=true');
    expect(anchor.text).toBe('Sign Up');
  });

  it('can set returnUrl through props', () => {
    const { container } = render(<SignUp returnUrl="/test">Sign Up</SignUp>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe('/api/auth/signin?register=true&return_url=%2Ftest');
    expect(anchor.text).toBe('Sign Up');
  });

  it('can set arbitrary props', () => {
    const { container } = render(
      <SignUp {...{ test: 1, custom: 'prop' }}>Sign Up</SignUp>
    );
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');
    const testAttribute = anchor.getAttribute('test');
    const customAtrribute = anchor.getAttribute('custom');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(3);
    expect(href).toBe('/api/auth/signin?register=true');
    expect(testAttribute).toBe('1');
    expect(customAtrribute).toBe('prop');
    expect(anchor.text).toBe('Sign Up');
  });
});

describe('<SignOut/>', () => {
  it('should render a link to signout endpoint', () => {
    const { container } = render(<SignOut>Sign Out</SignOut>);
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe('/api/auth/signout');
    expect(anchor.text).toBe('Sign Out');
  });

  it('can set returnUrl through props', () => {
    const { container } = render(
      <SignOut postLogoutUrl="/test">Sign Out</SignOut>
    );
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(1);
    expect(href).toBe('/api/auth/signout?post_logout_url=%2Ftest');
    expect(anchor.text).toBe('Sign Out');
  });

  it('can set arbitrary props', () => {
    const { container } = render(
      <SignOut {...{ test: 1, custom: 'prop' }}>Sign Out</SignOut>
    );
    const anchorElements = container.querySelectorAll('a');
    const anchor = anchorElements.item(0);
    const href = anchor.getAttribute('href');
    const testAttribute = anchor.getAttribute('test');
    const customAtrribute = anchor.getAttribute('custom');

    expect(anchorElements.length).toBe(1);
    expect(anchor.attributes.length).toBe(3);
    expect(href).toBe('/api/auth/signout');
    expect(testAttribute).toBe('1');
    expect(customAtrribute).toBe('prop');
    expect(anchor.text).toBe('Sign Out');
  });
});
