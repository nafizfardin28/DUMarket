import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { CheckCircleIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import useAutoDismiss from "../hooks/useAutoDismiss";

export default function LoginPage() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <AuthCard title="Welcome back" subtitle="Log in with your DU student email and password.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="field-label" htmlFor="email">
            DU student email
          </label>
          <div className="relative">
            <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@du.ac.bd"
              className="field-input pl-11"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="field-label mb-0" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeSlashIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        {needsVerification && (
          <button type="button" className="btn-link" onClick={handleResend}>
            {resent ? (
              <>
                <CheckCircleIcon className="h-4 w-4" /> Verification email sent again
              </>
            ) : (
              "Resend verification email"
            )}
          </button>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
          Register now
        </Link>
      </p>
    </AuthCard>
  );
}
