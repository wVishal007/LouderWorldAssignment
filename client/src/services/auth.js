import { useEffect, useState } from "react";
import { authAPI } from "./api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await authAPI.getUser();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
    refetchUser: fetchUser,
  };
};
