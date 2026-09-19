import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import OtpInput from "../components/OtpInput";
import { useAuth } from "../context/AuthContext";
import useAutoDismiss from "../hooks/useAutoDismiss";
import useOtpCountdown from "../hooks/useOtpCountdown";
import { OTP_LENGTH, formatCountdown } from "../utils/otp";

function RequestCodeStep({ email, setEmail, onSent }) {
  const { forgotPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useAutoDismiss(error, setError);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your DU email first.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await forgotPassword(email.trim().toLowerCase());
      onSent(data.otpExpiresAt);
    } catch {
      // forgot-password never errors on a real "not found" (generic response
      // by design) — only network/server failures land here.
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your DU email and we'll send you a 6-digit reset code."
    >
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
          {error && <p className="field-error">{error}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Sending…" : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}

function ResetPasswordStep({ email, initialExpiresAt }) {
  const { resetPassword, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentJustNow, setResentJustNow] = useState(false);
  const { secondsLeft, expired, setExpiresAt } = useOtpCountdown(initialExpiresAt);

  useAutoDismiss(errors, setErrors, { emptyValue: {}, isEmpty: (e) => Object.keys(e).length === 0 });

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (otp.length !== OTP_LENGTH) {
      setErrors({ otp: ["Enter the 6-digit code from your email."] });
      return;
    }
    if (expired) {
      setErrors({ otp: ["This code has expired. Request a new one below."] });
      return;
    }
    if (!password) {
      setErrors({ password: ["Password is required."] });
      return;
    }
    if (password !== password2) {
      setErrors({ password2: ["Passwords do not match."] });
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, otp, password, password2);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data && typeof data === "object" ? data : { detail: ["Something went wrong. Try again."] });
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResentJustNow(false);
    setErrors({});
    try {
      const data = await forgotPassword(email);
      setExpiresAt(data.otpExpiresAt);
      setOtp("");
      setResentJustNow(true);
    } finally {
      setResending(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Password reset">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <p className="text-sm text-stone-600">Your password has been changed. You can log in now.</p>
          <button onClick={() => navigate("/login")} className="btn-primary mt-2 !w-auto px-6">
            Go to login
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle={`Enter the code sent to ${email} and choose a new password.`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <OtpInput value={otp} onChange={setOtp} />
          <p className="mt-3 text-center text-xs font-medium text-stone-500">
            {expired ? (
              <span className="text-red-600">Code expired — request a new one.</span>
            ) : (
              <>
                Code expires in <span className="tabular-nums text-stone-700">{formatCountdown(secondsLeft)}</span>
              </>
            )}
          </p>
          {errors.otp && <p className="field-error text-center">{errors.otp[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
          {errors.password && <p className="field-error">{errors.password[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="password2">
            Confirm new password
          </label>
          <input
            id="password2"
            type="password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="field-input"
          />
          {errors.password2 && <p className="field-error">{errors.password2[0]}</p>}
        </div>

        {errors.detail && <p className="field-error">{errors.detail[0] || errors.detail}</p>}

        <button type="submit" disabled={submitting || expired} className="btn-primary">
          {submitting ? "Resetting…" : "Reset password"}
        </button>

        <p className="text-center text-sm text-stone-500">
          Didn't get a code?{" "}
          <button type="button" className="btn-link" onClick={handleResend} disabled={resending}>
            {resending ? "Resending…" : resentJustNow ? "Sent again ✔" : "Resend code"}
          </button>
        </p>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [step, setStep] = useState("request"); // "request" | "reset"

  if (step === "reset") {
    return <ResetPasswordStep email={email} initialExpiresAt={otpExpiresAt} />;
  }

  return (
    <RequestCodeStep
      email={email}
      setEmail={setEmail}
      onSent={(expiresAt) => {
        setOtpExpiresAt(expiresAt);
        setStep("reset");
      }}
    />
  );
}
