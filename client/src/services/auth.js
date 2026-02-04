import { useEffect, useState } from "react";
import { authAPI } from "./api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI
      .getUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
};
