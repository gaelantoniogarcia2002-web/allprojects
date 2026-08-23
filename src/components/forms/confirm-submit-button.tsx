"use client";

import type { MouseEvent, ReactNode } from "react";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  confirmMessage?: string;
};

/**
 * Submit button for the shared form components. When `confirmMessage` is
 * given, a single `window.confirm` gate blocks submission on decline —
 * reused by the Phase 3 delete flows behind one confirmation step.
 */
export function ConfirmSubmitButton({ children, confirmMessage }: ConfirmSubmitButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" onClick={handleClick}>
      {children}
    </button>
  );
}
