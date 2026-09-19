import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import OtpInput from "../components/OtpInput";
import { useAuth } from "../context/AuthContext";
import useAutoDismiss from "../hooks/useAutoDismiss";
import useOtpCountdown from "../hooks/useOtpCountdown";
import { HALLS } from "../constants/halls";
import { OTP_LENGTH, formatCountdown } from "../utils/otp";

const initialForm = {
  full_name: "",
  email: "",
  regNo: "",
  phone: "",
  role: "",
  password: "",
  password2: "",
  hall: "",
};

const DU_EMAIL_DOMAIN = "du.ac.bd";

function isDuEmail(email) {
  const domain = email.trim().toLowerCase().split("@").pop();
  // Accept the bare domain (rafi@du.ac.bd) as well as any department
  // subdomain DU issues under it (rafi@it.du.ac.bd, rafi@eee.du.ac.bd, ...).
  return domain === DU_EMAIL_DOMAIN || domain.endsWith(`.${DU_EMAIL_DOMAIN}`);
}

function validateForm(form) {
  const errors = {};

  if (!form.full_name.trim()) {
    errors.full_name = ["Full name is required."];
  }

  const regNo = form.regNo.trim();
  if (!regNo) {
    errors.regNo = ["Registration number is required."];
  } else if (!/^\d{1,10}$/.test(regNo)) {
    errors.regNo = ["Registration number must be numeric and at most 10 digits."];
  }

  if (!form.email.trim()) {
    errors.email = ["Email is required."];
  } else if (!isDuEmail(form.email)) {
    errors.email = [
      `Please sign up with your DU email (must be @${DU_EMAIL_DOMAIN} or a department address like @it.${DU_EMAIL_DOMAIN}).`,
    ];
  }

  const phone = form.phone.trim();
  if (!phone) {
    errors.phone = ["Phone number is required."];
  } else if (!/^01\d{0,9}$/.test(phone)) {
    errors.phone = ["Phone number must start with 01 and be at most 11 digits."];
  }

  if (!form.hall) {
    errors.hall = ["Please select your hall."];
  }

  if (!form.role) {
    errors.role = ["Please select whether you're buying or selling."];
  }

  if (!form.password) {
    errors.password = ["Password is required."];
  } else if (form.password.length !== 8) {
    errors.password = ["Password must be exactly 8 characters long."];
  }

  if (!form.password2) {
    errors.password2 = ["Please confirm your password."];
  } else if (form.password !== form.password2) {
    errors.password2 = ["Passwords do not match."];
  }

  return errors;
}

function OtpVerifyStep({ email, initialExpiresAt }) {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentJustNow, setResentJustNow] = useState(false);
  const { secondsLeft, expired, setExpiresAt } = useOtpCountdown(initialExpiresAt);

  useAutoDismiss(error, setError);

  // Redirect to login a beat after a successful verify, so the confirmation
  // is actually visible instead of the page just vanishing.
  useEffect(() => {
    if (!verified) return;
    const timeout = setTimeout(() => navigate("/login"), 1600);
    return () => clearTimeout(timeout);
  }, [verified, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (expired) {
      setError("This code has expired. Request a new one below.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmail(email, otp);
      setVerified(true);
    } catch (err) {
      const data = err.response?.data;
      const detail = data?.detail?.[0] || data?.detail || "That code didn't work. Try again.";
      setError(detail);
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResentJustNow(false);
    setError("");
    try {
      const data = await resendVerification(email);
      setExpiresAt(data.otpExpiresAt);
      setOtp("");
      setResentJustNow(true);
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <AuthCard title="Email verified">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <p className="text-sm text-stone-600">
            Your DU student account is confirmed. Taking you to login…
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Check your email 📬" subtitle={`We sent a 6-digit code to ${email}.`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <OtpInput value={otp} onChange={setOtp} />

          <p className="mt-3 text-center text-xs font-medium text-stone-500">
            {expired ? (
              <span className="text-red-600">Code expired — request a new one.</span>
            ) : (
              <>Code expires in <span className="tabular-nums text-stone-700">{formatCountdown(secondsLeft)}</span></>
            )}
          </p>

          {error && <p className="field-error text-center">{error}</p>}
        </div>

        <button type="submit" disabled={submitting || expired} className="btn-primary">
          {submitting ? "Verifying…" : "Verify email"}
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

export default function SignupPage() {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useAutoDismiss(errors, setErrors, { emptyValue: {}, isEmpty: (e) => Object.keys(e).length === 0 });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const data = await register(form);
      setOtpExpiresAt(data.otpExpiresAt);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      setErrors(
        data && typeof data === "object"
          ? data
          : { detail: ["Something went wrong. Try again."] },
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <OtpVerifyStep email={form.email} initialExpiresAt={otpExpiresAt} />;
  }

  return (
    <AuthCard
      title="Create your DUMarket account"
      subtitle={`Only @${DU_EMAIL_DOMAIN} emails can sign up.`}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Rafi Islam"
            className="field-input"
          />
          {errors.full_name && (
            <p className="field-error">{errors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="regNo">
            Registration Number
          </label>
          <input
            id="regNo"
            required
            inputMode="numeric"
            maxLength={10}
            value={form.regNo}
            onChange={(e) => update("regNo", e.target.value)}
            placeholder="202*******"
            className="field-input"
          />
          {errors.regNo && <p className="field-error">{errors.regNo[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="email">
            DU Institutional Mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={`your.name@${DU_EMAIL_DOMAIN}`}
            className="field-input"
          />
          {errors.email && <p className="field-error">{errors.email[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            inputMode="numeric"
            maxLength={11}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
            className="field-input"
          />
          {errors.phone && <p className="field-error">{errors.phone[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="hall">
            Hall
          </label>
          <select
            id="hall"
            name="hall"
            required
            value={form.hall}
            onChange={(e) => update("hall", e.target.value)}
            className="field-input"
          >
            <option value="">Select your hall…</option>
            {HALLS.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Role</legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-stone-300 bg-stone-100 p-1">
            <label
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-colors ${
                form.role === "buyer"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={form.role === "buyer"}
                onChange={() => update("role", "buyer")}
                className="sr-only"
              />
              Buyer
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-colors ${
                form.role === "seller"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="seller"
                checked={form.role === "seller"}
                onChange={() => update("role", "seller")}
                className="sr-only"
              />
              Seller
            </label>
          </div>
          {errors.role && <p className="field-error">{errors.role[0]}</p>}
        </fieldset>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            maxLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="field-input"
          />
          {errors.password && (
            <p className="field-error">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="password2">
            Confirm password
          </label>
          <input
            id="password2"
            type="password"
            required
            maxLength={8}
            value={form.password2}
            onChange={(e) => update("password2", e.target.value)}
            className="field-input"
          />
          {errors.password2 && (
            <p className="field-error">{errors.password2[0]}</p>
          )}
        </div>

        {errors.detail && (
          <p className="field-error sm:col-span-2">{errors.detail[0] || errors.detail}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary sm:col-span-2">
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
