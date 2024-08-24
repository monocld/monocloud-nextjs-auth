/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { useUser } from '../../client';
import { ProtectedComponentProps } from '../../types';

export const Protected: React.FC<ProtectedComponentProps> = ({
  children,
  onAccessDenied = null,
}) => {
  const { isLoading, error, isAuthenticated, user } = useUser();

  if (isLoading) {
    return null;
  }

  if (error || !isAuthenticated || !user) {
    if (onAccessDenied) {
      return <>{onAccessDenied}</>;
    }

    return null;
  }

  return <>{children}</>;
};
