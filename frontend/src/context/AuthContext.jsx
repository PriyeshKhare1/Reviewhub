/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });
  const [coins, setCoins] = useState(0);

  const refreshCoins = useCallback(() => {
    api.get("/users/wallet/coins")
      .then((res) => setCoins(res.data.coins))
      .catch(() => {});
  }, []);

  // Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch coins whenever user changes
  useEffect(() => {
    if (user) {
      refreshCoins();
    }
  }, [user, refreshCoins]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCoins(0);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, coins, refreshCoins }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
