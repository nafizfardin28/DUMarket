import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";
import useAutoDismiss from "../hooks/useAutoDismiss";

export default function LoginPage() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);

  useAutoDismiss(error, setError);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResent(false);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/listings");
    } catch (err) {
      const data = err.response?.data;
      const detail = data?.detail?.[0] || data?.detail || "Invalid email or password.";
      setError(detail);
      if (typeof detail === "string" && detail.toLowerCase().includes("verify")) {
        setNeedsVerification(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    await resendVerification(email);
    setResent(true);
  }

  return (
    <AuthCard title="Log in to DUMarket" subtitle="Use your DU student Gmail and password.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            DU student email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.name@du.ac.bd"
            className="field-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="field-label mb-0" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        {needsVerification && (
          <button type="button" className="btn-link" onClick={handleResend}>
            {resent ? "Verification email sent again ✔" : "Resend verification email"}
          </button>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Register now
        </Link>
      </p>
    </AuthCard>
  );
}
