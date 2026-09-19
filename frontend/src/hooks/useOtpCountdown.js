import { useEffect, useState } from "react";
import { secondsUntil } from "../utils/otp";

/** Drives a live countdown against a server-issued expiry timestamp.
 * `setExpiresAt` lets the caller restart the clock after a resend. */
export default function useOtpCountdown(initialExpiresAt) {
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(initialExpiresAt));

  useEffect(() => {
    setSecondsLeft(secondsUntil(expiresAt));
    const timer = setInterval(() => setSecondsLeft(secondsUntil(expiresAt)), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const expired = expiresAt != null && secondsLeft <= 0;
  return { secondsLeft, expired, expiresAt, setExpiresAt };
}
