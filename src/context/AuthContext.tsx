import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import {
  setAccessToken as setClientAccessToken,
  setTokenGetter,
  setRefreshHandler,
  setOnUnauthorized,
} from '../api/client';
import type { AuthUser, LoginRequest } from '../types/auth';
import type { UserProfile } from '../types/user';

/**
 * Centralized localStorage key for refresh token session persistence.
 */
export const REFRESH_TOKEN_KEY = 'devolatical_refresh_token';

/**
 * Combined type representing either basic authentication identity or full enterprise user profile.
 */
export type CurrentUser = UserProfile | AuthUser;

/**
 * Authentication Context Interface contract.
 */
export interface AuthContextType {
  user: CurrentUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ user: CurrentUser; destination: string }>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper to normalize role names and codes for resilient comparison.
 * e.g. "Super Admin" and "SUPER_ADMIN" normalize to "superadmin".
 */
function normalizeRole(roleString: string): string {
  return roleString.toLowerCase().replace(/[\s_-]+/g, '');
}

/**
 * Helper to evaluate whether a user possesses a target role code or name.
 */
export function checkUserRole(user: CurrentUser | null, targetRole: string): boolean {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  const normalizedTarget = normalizeRole(targetRole);

  return user.roles.some((r) => {
    if (typeof r === 'string') {
      return normalizeRole(r) === normalizedTarget;
    }
    if (typeof r === 'object' && r !== null) {
      const codeMatch = r.code ? normalizeRole(r.code) === normalizedTarget : false;
      const nameMatch = r.name ? normalizeRole(r.name) === normalizedTarget : false;
      return codeMatch || nameMatch;
    }
    return false;
  });
}

/**
 * Helper to determine the authorized landing route based on authenticated roles.
 */
export function getDestinationForUser(user: CurrentUser): string {
  const isAdmin =
    checkUserRole(user, 'SUPER_ADMIN') ||
    checkUserRole(user, 'ADMIN') ||
    checkUserRole(user, 'Super Admin') ||
    checkUserRole(user, 'Admin');

  if (isAdmin) {
    return '/admin';
  }

  const isEmployee =
    checkUserRole(user, 'EMPLOYEE') ||
    checkUserRole(user, 'Employee');

  if (isEmployee) {
    return '/employee';
  }

  return '/portal';
}


interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize access token in memory with the API client
  const updateAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setClientAccessToken(token);
  }, []);

  // Safe localStorage helper for refresh token
  const getStoredRefreshToken = useCallback((): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }, []);

  const setStoredRefreshToken = useCallback((token: string | null) => {
    try {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }, []);

  /**
   * Evaluates if current user possesses a specific role.
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return checkUserRole(user, role);
    },
    [user]
  );

  /**
   * Evaluates if current user possesses any of the specified roles.
   */
  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      if (!user || !roles || roles.length === 0) return false;
      return roles.some((role) => checkUserRole(user, role));
    },
    [user]
  );

  /**
   * Executes logout workflow: calls server logout, clears local tokens and state.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (accessToken) {
        await authApi.logout();
      }
    } catch {
      // Ignore network or token expiration failures during logout
    } finally {
      updateAccessToken(null);
      setStoredRefreshToken(null);
      setUser(null);
    }
  }, [accessToken, updateAccessToken, setStoredRefreshToken]);

  /**
   * Attempts to renew session tokens using stored refresh token.
   * Returns true on success, false on failure.
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      return false;
    }

    try {
      const response = await authApi.refreshToken({ refreshToken: storedRefreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: authUser } =
        response.data;

      updateAccessToken(newAccessToken);
      if (newRefreshToken) {
        setStoredRefreshToken(newRefreshToken);
      }

      // Attempt to load full user profile
      try {
        const profileResponse = await usersApi.getMyProfile();
        setUser(profileResponse.data);
      } catch {
        setUser(authUser);
      }

      return true;
    } catch {
      updateAccessToken(null);
      setStoredRefreshToken(null);
      setUser(null);
      return false;
    }
  }, [getStoredRefreshToken, updateAccessToken, setStoredRefreshToken]);

  /**
   * Executes credentials login workflow.
   */
  const login = useCallback(
    async (credentials: LoginRequest): Promise<{ user: CurrentUser; destination: string }> => {
      const response = await authApi.login(credentials);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: authUser } =
        response.data;

      updateAccessToken(newAccessToken);
      if (newRefreshToken) {
        setStoredRefreshToken(newRefreshToken);
      }

      let activeUser: CurrentUser = authUser;
      try {
        const profileResponse = await usersApi.getMyProfile();
        activeUser = profileResponse.data;
        setUser(activeUser);
      } catch {
        setUser(authUser);
      }

      const destination = getDestinationForUser(activeUser);
      return { user: activeUser, destination };
    },
    [updateAccessToken, setStoredRefreshToken]
  );

  // Register token getter and refresh interceptors with the centralized API client
  useEffect(() => {
    setTokenGetter(() => accessToken);
    setRefreshHandler(async () => {
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) return null;

      try {
        const res = await authApi.refreshToken({ refreshToken: storedRefreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: authUser } =
          res.data;

        updateAccessToken(newAccessToken);
        if (newRefreshToken) {
          setStoredRefreshToken(newRefreshToken);
        }

        try {
          const profile = await usersApi.getMyProfile();
          setUser(profile.data);
        } catch {
          setUser(authUser);
        }

        return newAccessToken;
      } catch {
        updateAccessToken(null);
        setStoredRefreshToken(null);
        setUser(null);
        return null;
      }
    });

    setOnUnauthorized(() => {
      updateAccessToken(null);
      setStoredRefreshToken(null);
      setUser(null);
    });
  }, [accessToken, getStoredRefreshToken, updateAccessToken, setStoredRefreshToken]);

  // Initial application authentication bootstrap
  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const storedRefreshToken = getStoredRefreshToken();
      if (!storedRefreshToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.refreshToken({ refreshToken: storedRefreshToken });
        if (!isMounted) return;

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: authUser } =
          res.data;

        updateAccessToken(newAccessToken);
        if (newRefreshToken) {
          setStoredRefreshToken(newRefreshToken);
        }

        try {
          const profile = await usersApi.getMyProfile();
          if (isMounted) setUser(profile.data);
        } catch {
          if (isMounted) setUser(authUser);
        }
      } catch {
        if (isMounted) {
          updateAccessToken(null);
          setStoredRefreshToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [getStoredRefreshToken, updateAccessToken, setStoredRefreshToken]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      logout,
      hasRole,
      hasAnyRole,
      refreshSession,
    }),
    [user, accessToken, isLoading, login, logout, hasRole, hasAnyRole, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access centralized Authentication Context.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
