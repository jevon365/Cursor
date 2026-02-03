import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'google_access_token';
const EXPIRY_KEY = 'google_token_expiry';

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token) return null;
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return null;
  }
  return token;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
  }, []);

  const isSignedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, logout, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
