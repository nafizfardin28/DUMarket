import { useEffect } from "react";

/**
 * Clears `value` back to `emptyValue` a fixed delay after it becomes
 * non-empty, so error messages don't sit on screen forever.
 *
 * `isEmpty` lets callers say what "no error" looks like for their state
 * shape — an empty string, an empty object, etc.
 */
export default function useAutoDismiss(value, setValue, { delay = 5000, emptyValue = "", isEmpty } = {}) {
  const empty = isEmpty ? isEmpty(value) : !value;

  useEffect(() => {
    if (empty) return;
    const timer = setTimeout(() => setValue(emptyValue), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
