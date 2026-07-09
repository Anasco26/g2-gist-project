import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUser, setUser, clearAuth, apiFetchMe, apiLogout, apiLogin, apiRegister } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleForceLogout = () => setUserState(null);
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      apiFetchMe().then((u) => {
        setUserState(u);
        setLoading(false);
      }).catch(() => {
        clearAuth();
        setUserState(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    setUserState(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (body) => {
    const data = await apiRegister(body);
    setUserState(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
