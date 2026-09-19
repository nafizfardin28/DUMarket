import { useRef } from "react";
import { OTP_LENGTH } from "../utils/otp";

/** Controlled 6-digit code entry: `value`/`onChange` carry the joined
 * digit string. Supports pasting a full code into any box, auto-advances
 * focus as you type, and Backspace on an empty box steps back. */
export default function OtpInput({ length = OTP_LENGTH, value, onChange, disabled, autoFocus = true }) {
  const digits = Array.from({ length }, (_, i) => value[i] || "");
  const inputRefs = useRef([]);

  function focusInput(index) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function updateDigit(index, rawValue) {
    const val = rawValue.replace(/\D/g, "");
    if (!val) {
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    const chars = val.split("");
    const next = digits.slice();
    chars.forEach((char, offset) => {
      if (index + offset < length) next[index + offset] = char;
    });
    onChange(next.join(""));
    focusInput(Math.min(index + chars.length, length - 1));
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          disabled={disabled}
          onChange={(e) => updateDigit(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          autoFocus={autoFocus && index === 0}
          className="h-12 w-11 rounded-lg border border-stone-300 text-center text-xl font-semibold
            text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
