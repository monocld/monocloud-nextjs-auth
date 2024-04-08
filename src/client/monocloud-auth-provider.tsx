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
import type { MonoCloudUser } from '@monocloud/node-auth-core-sdk';

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

const MonoCloudAuthContext = createContext<AuthState>({ ...initialState });

export const useUser = () => useContext(MonoCloudAuthContext);

const fetchUser = async (): Promise<MonoCloudUser | undefined> => {
  const response = await fetch('/api/auth/userinfo');

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
