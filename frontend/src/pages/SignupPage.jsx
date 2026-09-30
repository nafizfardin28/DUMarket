import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import OtpInput from "../components/OtpInput";
import {
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  HashtagIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
} from "../components/icons";
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <p className="text-sm text-zinc-600">Your DU student account is confirmed. Taking you to login…</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Check your email" subtitle={`We sent a 6-digit code to ${email}.`}>
      <div className="mb-5 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <EnvelopeIcon className="h-6 w-6" />
        </div>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <OtpInput value={otp} onChange={setOtp} />

          <p className="mt-3 text-center text-xs font-medium text-zinc-500">
            {expired ? (
              <span className="text-rose-600">Code expired — request a new one.</span>
            ) : (
              <>
                Code expires in <span className="tabular-nums text-zinc-700">{formatCountdown(secondsLeft)}</span>
              </>
            )}
          </p>

          {error && <p className="field-error justify-center">{error}</p>}
        </div>

        <button type="submit" disabled={submitting || expired} className="btn-primary">
          {submitting ? "Verifying…" : "Verify email"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          Didn't get a code?{" "}
          <button type="button" className="btn-link" onClick={handleResend} disabled={resending}>
            {resending ? "Resending…" : resentJustNow ? "Sent again" : "Resend code"}
            {resentJustNow && <CheckCircleIcon className="h-3.5 w-3.5" />}
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

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
      title="Create your account"
      subtitle={`Only @${DU_EMAIL_DOMAIN} emails can sign up.`}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="full_name">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="full_name"
              type="text"
              required
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Rafi Islam"
              className="field-input pl-11"
            />
          </div>
          {errors.full_name && (
            <p className="field-error">{errors.full_name[0]}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="regNo">
            Registration Number
          </label>
          <div className="relative">
            <HashtagIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="regNo"
              required
              inputMode="numeric"
              maxLength={10}
              value={form.regNo}
              onChange={(e) => update("regNo", e.target.value)}
              placeholder="202*******"
              className="field-input pl-11"
            />
          </div>
          {errors.regNo && <p className="field-error">{errors.regNo[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="email">
            DU Institutional Mail
          </label>
          <div className="relative">
            <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder={`your.name@${DU_EMAIL_DOMAIN}`}
              className="field-input pl-11"
            />
          </div>
          {errors.email && <p className="field-error">{errors.email[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="phone">
            Phone Number
          </label>
          <div className="relative">
            <PhoneIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="phone"
              type="tel"
              required
              inputMode="numeric"
              maxLength={11}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="01XXXXXXXXX"
              className="field-input pl-11"
            />
          </div>
          {errors.phone && <p className="field-error">{errors.phone[0]}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="hall">
            Hall
          </label>
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <select
              id="hall"
              name="hall"
              required
              value={form.hall}
              onChange={(e) => update("hall", e.target.value)}
              className="field-input appearance-none pl-11"
            >
              <option value="">Select your hall…</option>
              {HALLS.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        <fieldset>
          <legend className="field-label">Role</legend>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-[15px] font-semibold transition-all ${
                form.role === "buyer"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
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
              <ShoppingBagIcon className="h-[18px] w-[18px]" />
              Buyer
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-[15px] font-semibold transition-all ${
                form.role === "seller"
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
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
              <TagIcon className="h-[18px] w-[18px]" />
              Seller
            </label>
          </div>
          {errors.role && <p className="field-error">{errors.role[0]}</p>}
        </fieldset>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              maxLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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
          {errors.password && (
            <p className="field-error">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="password2">
            Confirm password
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
            <input
              id="password2"
              type={showPassword2 ? "text" : "password"}
              required
              maxLength={8}
              value={form.password2}
              onChange={(e) => update("password2", e.target.value)}
              className="field-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword2((s) => !s)}
              aria-label={showPassword2 ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword2 ? <EyeSlashIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
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

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
