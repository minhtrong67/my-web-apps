import { useEffect, useState } from 'react';

/**
 * Keeps an element mounted for `exitMs` after `open` turns false so it can play an exit animation.
 * Returns { present, closing }: render while `present`; apply the exit animation while `closing`.
 */
export function usePresence(open, exitMs = 220) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true); // adjust state while rendering (no extra effect pass)
  useEffect(() => {
    if (open || !present) return undefined;
    const id = setTimeout(() => setPresent(false), exitMs);
    return () => clearTimeout(id);
  }, [open, present, exitMs]);
  return { present, closing: present && !open };
}
