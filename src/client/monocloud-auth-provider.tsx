'use client';

import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { MonoCloudUser } from '@monocloud/node-auth-core';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: Error;
  user?: MonoCloudUser;
}

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: undefined,
  error: undefined,
};

const MonoCloudAuthContext = createContext<AuthState>(
  undefined as unknown as AuthState
);

export const useUser = () => {
  const ctx = useContext(MonoCloudAuthContext);

  if (!ctx) {
    throw new Error(
      `useUser() can only be used inside <MonoCloudAuthProvider>...</MonoCloudAuthProvider>. To setup MonoCloud Auth Provider visit any of the following links.
        App Router - https://www.monocloud.com/docs/sdk-reference/nextjs/app-router/getting-started.
        Router - https://www.monocloud.com/docs/sdk-reference/nextjs/page-router/getting-started.
      `
    );
  }

  return ctx;
};

const fetchUser = async (): Promise<MonoCloudUser | undefined> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_MONOCLOUD_AUTH_USER_INFO_URL ??
      // eslint-disable-next-line no-underscore-dangle
      `${process.env.__NEXT_ROUTER_BASEPATH ?? ''}/api/auth/userinfo`
  );

  if (response.status === 204) {
    return undefined;
  }

  if (response.ok) {
    return response.json();
  }

  throw new Error('Failed to fetch user');
};

export const MonoCloudAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement<AuthState> => {
  const [authState, setAuthState] = useState<AuthState>({
    ...initialState,
  });

  const getUser = useCallback(async () => {
    try {
      const user = await fetchUser();

      setAuthState(state => ({
        ...state,
        isLoading: false,
        isAuthenticated: !!user && Object.keys(user).length > 0,
        error: undefined,
        user,
      }));
    } catch (error) {
      setAuthState(state => ({
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error,
        user: undefined,
      }));
    }
  }, []);

  useEffect((): void => {
    if (!authState.user) {
      getUser();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.user]);

  const { isLoading, isAuthenticated, user, error } = authState;

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      error,
    }),
    [isLoading, isAuthenticated, user, error]
  );

  return (
    <MonoCloudAuthContext.Provider value={value}>
      {children}
    </MonoCloudAuthContext.Provider>
  );
};
