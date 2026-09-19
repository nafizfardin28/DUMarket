import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me/")
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login/", { email, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    // payload: { email, full_name, role, password, password2, hall?, phone? }
    const { data } = await api.post("/auth/register/", payload);
    return data;
  }

  async function verifyEmail(email, otp) {
    const { data } = await api.post("/auth/verify-email/", { email, otp });
    return data;
  }

  async function resendVerification(email) {
    const { data } = await api.post("/auth/resend-verification/", { email });
    return data;
  }

  async function forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password/", { email });
    return data;
  }

  async function resetPassword(email, otp, password, password2) {
    const { data } = await api.post("/auth/reset-password/", { email, otp, password, password2 });
    return data;
  }

  async function updateAvatar(file) {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await api.patch("/auth/me/avatar/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      updateAvatar,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
