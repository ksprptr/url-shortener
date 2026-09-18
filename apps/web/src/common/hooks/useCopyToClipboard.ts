'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const COPIED_RESET_MS = 2000;

/**
 * Copies text to the clipboard and reports a short-lived `copied` flag for the button's tick.
 **/
export function useCopyToClipboard(): {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    },
    [],
  );

  const copy = useCallback(async (value: string) => {
    try {
      // Undefined on an insecure origin (plain http on a LAN address), so guard rather than throw.
      if (!navigator.clipboard) {
        return false;
      }

      await navigator.clipboard.writeText(value);
      setCopied(true);

      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);

      return true;
    } catch {
      return false;
    }
  }, []);

  return { copied, copy };
}
