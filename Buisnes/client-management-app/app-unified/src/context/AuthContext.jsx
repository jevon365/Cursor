import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user from API
          const userData = await authService.getMe();
          if (isMounted && userData) {
            // Only update if user data actually changed
            setUser(prevUser => {
              // Compare by ID to avoid unnecessary updates
              if (prevUser?.id === userData.id && 
                  JSON.stringify(prevUser?.roles || []) === JSON.stringify(userData.roles || [])) {
                return prevUser; // Return same reference if data hasn't changed
              }
              return userData;
            });
          }
        } else {
          // Try to get from localStorage as fallback
          const localUser = authService.getCurrentUser();
          if (isMounted) {
            setUser(localUser);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth
        authService.logout();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (email, password, name, roles = ['admin']) => {
    try {
      const response = await authService.register(email, password, name, roles);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getMe();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
      throw error;
    }
  }, [logout]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const roles = useMemo(() => {
    const r = user?.roles ?? (user?.role ? [user.role] : []);
    return Array.isArray(r) ? r : [];
  }, [user]);

  const hasRole = useCallback((role) => roles.includes(role), [roles]);
  const hasAnyRole = useCallback((allowed) => {
    const arr = Array.isArray(allowed) ? allowed : [allowed];
    return arr.some((r) => roles.includes(r));
  }, [roles]);
  const hasAllRoles = useCallback((required) => {
    const arr = Array.isArray(required) ? required : [required];
    return arr.every((r) => roles.includes(r));
  }, [roles]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    roles,
  }), [user, loading, login, register, logout, refreshUser, isAuthenticated, hasRole, hasAnyRole, hasAllRoles, roles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
