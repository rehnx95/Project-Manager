import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, clearToken, decodeToken, getToken, setToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setCurrentToken] = useState(getToken);
  const user = useMemo(() => token ? decodeToken(token) : null, [token]);
  const signIn = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    if (!response?.token) throw new Error("The server did not return a sign-in token.");
    setToken(response.token);
    setCurrentToken(response.token);
  }, []);
  const signOut = useCallback(async (remote = true) => {
    let logoutError;
    try {
      if (remote && getToken()) await authApi.logout();
    } catch (error) {
      logoutError = error;
    } finally {
      clearToken();
      setCurrentToken(null);
    }
    if (logoutError) throw logoutError;
  }, []);

  useEffect(() => {
    const synchronize = () => setCurrentToken(getToken());
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);

  const value = useMemo(() => ({ token, user, signIn, signOut }), [token, user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
